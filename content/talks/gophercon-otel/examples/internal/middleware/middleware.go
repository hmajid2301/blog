package middleware

import (
	"context"
	"fmt"
	"log/slog"
	"net/http"
	"runtime/debug"
	"strconv"
	"strings"
	"sync"
	"time"

	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/metric"
	"golang.org/x/time/rate"

	"github.com/hmajid2301/user-service/internal/config"
)

type Middleware struct {
	logger    *slog.Logger
	config    *config.Config
	limiter   *rate.Limiter
	requestID uint64
	mu        sync.Mutex
}

type contextKey string

const (
	RequestIDKey contextKey = "request_id"
)

func New(logger *slog.Logger, cfg *config.Config) *Middleware {
	// Configure rate limiter: 100 requests per second with burst of 200
	limiter := rate.NewLimiter(100, 200)

	return &Middleware{
		logger:  logger,
		config:  cfg,
		limiter: limiter,
	}
}

// Recovery middleware with proper error handling and logging
func (m *Middleware) Recovery(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if err := recover(); err != nil {
				// Log the panic with stack trace
				stack := debug.Stack()
				m.logger.ErrorContext(r.Context(), "panic recovered",
					slog.Any("panic", err),
					slog.String("stack", string(stack)),
					slog.String("method", r.Method),
					slog.String("path", r.URL.Path),
					slog.String("remote_addr", r.RemoteAddr),
				)

				// Return 500 error
				http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			}
		}()

		next.ServeHTTP(w, r)
	})
}

// RequestID middleware adds unique request ID to context and response headers
func (m *Middleware) RequestID(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Check if request ID already exists in headers
		requestID := r.Header.Get("X-Request-ID")
		if requestID == "" {
			// Generate new request ID
			m.mu.Lock()
			m.requestID++
			requestID = fmt.Sprintf("%d-%d", time.Now().Unix(), m.requestID)
			m.mu.Unlock()
		}

		// Add to response headers
		w.Header().Set("X-Request-ID", requestID)

		// Add to context
		ctx := context.WithValue(r.Context(), RequestIDKey, requestID)
		r = r.WithContext(ctx)

		next.ServeHTTP(w, r)
	})
}

// Security middleware adds security headers
func (m *Middleware) Security(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Security headers
		w.Header().Set("X-Content-Type-Options", "nosniff")
		w.Header().Set("X-Frame-Options", "DENY")
		w.Header().Set("X-XSS-Protection", "1; mode=block")
		w.Header().Set("Referrer-Policy", "strict-origin-when-cross-origin")

		if m.config.IsProduction() {
			w.Header().Set("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
		}

		next.ServeHTTP(w, r)
	})
}

// RateLimit middleware implements rate limiting
func (m *Middleware) RateLimit(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Skip rate limiting for health checks
		if r.URL.Path == "/health" || r.URL.Path == "/readiness" {
			next.ServeHTTP(w, r)
			return
		}

		if !m.limiter.Allow() {
			m.logger.WarnContext(r.Context(), "rate limit exceeded",
				slog.String("remote_addr", r.RemoteAddr),
				slog.String("method", r.Method),
				slog.String("path", r.URL.Path),
			)

			w.Header().Set("Retry-After", "1")
			http.Error(w, "Rate limit exceeded", http.StatusTooManyRequests)
			return
		}

		next.ServeHTTP(w, r)
	})
}

var (
	metricsOnce  sync.Once
	requestCount metric.Int64Counter
	latencyHist  metric.Float64Histogram
	requestSize  metric.Int64Histogram
	responseSize metric.Int64Histogram
	activeReqs   metric.Int64UpDownCounter
)

// Metrics middleware with comprehensive HTTP metrics
func (m *Middleware) Metrics(next http.Handler) http.Handler {
	metricsOnce.Do(func() {
		if !m.config.OTEL.Enabled {
			return
		}

		meter := otel.GetMeterProvider().Meter("http.server")

		var err error
		requestCount, err = meter.Int64Counter(
			"http_server_requests_total",
			metric.WithUnit("1"),
			metric.WithDescription("Total number of HTTP requests"),
		)
		if err != nil {
			m.logger.Error("failed to create request counter", slog.String("error", err.Error()))
		}

		latencyHist, err = meter.Float64Histogram(
			"http_server_request_duration_seconds",
			metric.WithUnit("s"),
			metric.WithDescription("HTTP request duration in seconds"),
			metric.WithExplicitBucketBoundaries(0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10),
		)
		if err != nil {
			m.logger.Error("failed to create latency histogram", slog.String("error", err.Error()))
		}

		requestSize, err = meter.Int64Histogram(
			"http_server_request_size_bytes",
			metric.WithUnit("By"),
			metric.WithDescription("HTTP request size in bytes"),
		)
		if err != nil {
			m.logger.Error("failed to create request size histogram", slog.String("error", err.Error()))
		}

		responseSize, err = meter.Int64Histogram(
			"http_server_response_size_bytes",
			metric.WithUnit("By"),
			metric.WithDescription("HTTP response size in bytes"),
		)
		if err != nil {
			m.logger.Error("failed to create response size histogram", slog.String("error", err.Error()))
		}

		activeReqs, err = meter.Int64UpDownCounter(
			"http_server_active_requests",
			metric.WithUnit("1"),
			metric.WithDescription("Number of active HTTP requests"),
		)
		if err != nil {
			m.logger.Error("failed to create active requests counter", slog.String("error", err.Error()))
		}
	})

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Skip metrics for certain endpoints to avoid high cardinality
		path := r.URL.Path
		if strings.HasPrefix(path, "/static") || path == "/favicon.ico" {
			next.ServeHTTP(w, r)
			return
		}

		start := time.Now()
		ww := wrapResponseWriter(w)

		// Increment active requests
		if activeReqs != nil {
			activeReqs.Add(r.Context(), 1)
			defer activeReqs.Add(r.Context(), -1)
		}

		next.ServeHTTP(ww, r)

		duration := time.Since(start)
		statusCode := ww.Status()
		if statusCode == 0 {
			statusCode = http.StatusOK
		}

		// Sanitize path for metrics (avoid high cardinality)
		sanitizedPath := sanitizePath(r.URL.Path)
		statusClass := fmt.Sprintf("%dxx", statusCode/100)

		attrs := []attribute.KeyValue{
			attribute.String("method", r.Method),
			attribute.String("route", sanitizedPath),
			attribute.String("status_class", statusClass),
			attribute.Int("status_code", statusCode),
		}

		ctx := r.Context()

		// Record metrics
		if requestCount != nil {
			requestCount.Add(ctx, 1, metric.WithAttributes(attrs...))
		}

		if latencyHist != nil {
			latencyHist.Record(ctx, duration.Seconds(), metric.WithAttributes(attrs...))
		}

		if requestSize != nil && r.ContentLength >= 0 {
			requestSize.Record(ctx, r.ContentLength, metric.WithAttributes(attrs...))
		}

		if responseSize != nil {
			responseSize.Record(ctx, int64(ww.size), metric.WithAttributes(attrs...))
		}
	})
}

// Logging middleware with structured request/response logging
func (m *Middleware) Logging(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Skip logging for health checks in production
		if m.config.IsProduction() && (r.URL.Path == "/health" || r.URL.Path == "/readiness") {
			next.ServeHTTP(w, r)
			return
		}

		start := time.Now()
		ww := wrapResponseWriter(w)

		// Get request ID from context
		requestID, _ := r.Context().Value(RequestIDKey).(string)

		// Log request start
		m.logger.InfoContext(r.Context(), "request started",
			slog.String("request_id", requestID),
			slog.String("method", r.Method),
			slog.String("path", r.URL.Path),
			slog.String("query", r.URL.RawQuery),
			slog.String("remote_addr", r.RemoteAddr),
			slog.String("user_agent", r.UserAgent()),
			slog.Int64("content_length", r.ContentLength),
		)

		next.ServeHTTP(ww, r)

		duration := time.Since(start)
		statusCode := ww.Status()
		if statusCode == 0 {
			statusCode = http.StatusOK
		}

		// Determine log level based on status code
		logLevel := slog.LevelInfo
		if statusCode >= 400 && statusCode < 500 {
			logLevel = slog.LevelWarn
		} else if statusCode >= 500 {
			logLevel = slog.LevelError
		}

		// Log request completion
		m.logger.Log(r.Context(), logLevel, "request completed",
			slog.String("request_id", requestID),
			slog.String("method", r.Method),
			slog.String("path", r.URL.Path),
			slog.Int("status", statusCode),
			slog.Duration("duration", duration),
			slog.Int("response_size", ww.size),
		)
	})
}

// responseWriter wraps http.ResponseWriter to capture status and size
type responseWriter struct {
	http.ResponseWriter
	status int
	size   int
}

func wrapResponseWriter(w http.ResponseWriter) *responseWriter {
	return &responseWriter{ResponseWriter: w}
}

func (rw *responseWriter) Status() int {
	return rw.status
}

func (rw *responseWriter) WriteHeader(code int) {
	rw.status = code
	rw.ResponseWriter.WriteHeader(code)
}

func (rw *responseWriter) Write(b []byte) (int, error) {
	size, err := rw.ResponseWriter.Write(b)
	rw.size += size
	return size, err
}

// sanitizePath removes IDs and other high-cardinality values from paths
func sanitizePath(path string) string {
	// Replace numeric IDs with {id}
	parts := strings.Split(path, "/")
	for i, part := range parts {
		if _, err := strconv.Atoi(part); err == nil && len(part) > 0 {
			parts[i] = "{id}"
		}
		// Replace UUIDs with {uuid}
		if len(part) == 36 && strings.Count(part, "-") == 4 {
			parts[i] = "{uuid}"
		}
	}
	return strings.Join(parts, "/")
}
