package telemetry

import (
	"context"
	"fmt"
	"log/slog"
	"os"
	"time"

	"github.com/lmittmann/tint"
	slogmulti "github.com/samber/slog-multi"
	"go.opentelemetry.io/contrib/bridges/otelslog"
	"go.opentelemetry.io/contrib/instrumentation/host"
	"go.opentelemetry.io/contrib/instrumentation/runtime"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/exporters/otlp/otlplog/otlploghttp"
	"go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetrichttp"
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp"
	"go.opentelemetry.io/otel/log/global"
	"go.opentelemetry.io/otel/propagation"
	"go.opentelemetry.io/otel/sdk/log"
	"go.opentelemetry.io/otel/sdk/metric"
	"go.opentelemetry.io/otel/sdk/resource"
	"go.opentelemetry.io/otel/sdk/trace"

	"github.com/hmajid2301/user-service/internal/config"
)

type TracerProvider struct {
	*trace.TracerProvider
}

type MeterProvider struct {
	*metric.MeterProvider
}

type LoggerProvider struct {
	*log.LoggerProvider
}

func NewTracerProvider(ctx context.Context, cfg *config.Config) (*TracerProvider, error) {
	if !cfg.OTEL.Enabled {
		return &TracerProvider{trace.NewNoopTracerProvider()}, nil
	}

	// Create resource with comprehensive attributes
	res, err := newResource(ctx, cfg)
	if err != nil {
		return nil, fmt.Errorf("failed to create resource: %w", err)
	}

	// Create OTLP exporter with proper configuration
	exporter, err := otlptracehttp.New(ctx,
		otlptracehttp.WithEndpoint(cfg.OTEL.Endpoint),
		otlptracehttp.WithInsecure(), // Use TLS in production
		otlptracehttp.WithTimeout(10*time.Second),
		otlptracehttp.WithRetry(otlptracehttp.RetryConfig{
			Enabled:         true,
			InitialInterval: 1 * time.Second,
			MaxInterval:     30 * time.Second,
			MaxElapsedTime:  5 * time.Minute,
		}),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create trace exporter: %w", err)
	}

	// Configure trace provider with production settings
	var samplerOption trace.TracerProviderOption
	if cfg.IsProduction() {
		// Use probabilistic sampling in production (1% sample rate)
		samplerOption = trace.WithSampler(trace.TraceIDRatioBased(0.01))
	} else {
		// Sample all traces in development
		samplerOption = trace.WithSampler(trace.AlwaysSample())
	}

	tp := trace.NewTracerProvider(
		trace.WithBatcher(exporter,
			trace.WithBatchTimeout(5*time.Second),
			trace.WithMaxExportBatchSize(512),
			trace.WithMaxQueueSize(2048),
		),
		trace.WithResource(res),
		samplerOption,
	)

	// Set global tracer provider and propagators
	otel.SetTracerProvider(tp)
	otel.SetTextMapPropagator(
		propagation.NewCompositeTextMapPropagator(
			propagation.TraceContext{},
			propagation.Baggage{},
		),
	)

	return &TracerProvider{tp}, nil
}

func NewMeterProvider(ctx context.Context, cfg *config.Config) (*MeterProvider, error) {
	if !cfg.OTEL.Enabled {
		return &MeterProvider{metric.NewNoopMeterProvider()}, nil
	}

	// Create resource
	res, err := newResource(ctx, cfg)
	if err != nil {
		return nil, fmt.Errorf("failed to create resource: %w", err)
	}

	// Create OTLP exporter
	exporter, err := otlpmetrichttp.New(ctx,
		otlpmetrichttp.WithEndpoint(cfg.OTEL.Endpoint),
		otlpmetrichttp.WithInsecure(), // Use TLS in production
		otlpmetrichttp.WithTimeout(10*time.Second),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create metric exporter: %w", err)
	}

	// Configure metric collection interval based on environment
	var interval time.Duration
	if cfg.IsProduction() {
		interval = 30 * time.Second // Less frequent in production
	} else {
		interval = 10 * time.Second // More frequent in development
	}

	// Create meter provider
	mp := metric.NewMeterProvider(
		metric.WithReader(
			metric.NewPeriodicReader(exporter,
				metric.WithInterval(interval),
				metric.WithTimeout(5*time.Second),
			),
		),
		metric.WithResource(res),
	)

	// Start runtime metrics collection
	if err := runtime.Start(runtime.WithMeterProvider(mp)); err != nil {
		return nil, fmt.Errorf("failed to start runtime metrics: %w", err)
	}

	// Start host metrics collection
	if err := host.Start(host.WithMeterProvider(mp)); err != nil {
		return nil, fmt.Errorf("failed to start host metrics: %w", err)
	}

	// Set global meter provider
	otel.SetMeterProvider(mp)
	return &MeterProvider{mp}, nil
}

func NewLoggerProvider(ctx context.Context, cfg *config.Config) (*LoggerProvider, error) {
	if !cfg.OTEL.Enabled {
		return &LoggerProvider{log.NewNoopLoggerProvider()}, nil
	}

	// Create resource
	res, err := newResource(ctx, cfg)
	if err != nil {
		return nil, fmt.Errorf("failed to create resource: %w", err)
	}

	// Create OTLP exporter
	exporter, err := otlploghttp.New(ctx,
		otlploghttp.WithEndpoint(cfg.OTEL.Endpoint),
		otlploghttp.WithInsecure(), // Use TLS in production
		otlploghttp.WithTimeout(10*time.Second),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create log exporter: %w", err)
	}

	// Create logger provider with batching
	lp := log.NewLoggerProvider(
		log.WithProcessor(
			log.NewBatchProcessor(exporter,
				log.WithBatchTimeout(5*time.Second),
				log.WithMaxQueueSize(2048),
			),
		),
		log.WithResource(res),
	)

	// Set global logger provider
	global.SetLoggerProvider(lp)
	return &LoggerProvider{lp}, nil
}

func NewLogger(cfg *config.Config) *slog.Logger {
	var handler slog.Handler

	// Configure log level
	var level slog.Level
	switch cfg.App.LogLevel {
	case "debug":
		level = slog.LevelDebug
	case "info":
		level = slog.LevelInfo
	case "warn":
		level = slog.LevelWarn
	case "error":
		level = slog.LevelError
	default:
		level = slog.LevelInfo
	}

	if cfg.IsDevelopment() {
		// Development: pretty console output + OTEL
		stdoutHandler := tint.NewHandler(os.Stdout, &tint.Options{
			AddSource:  true,
			TimeFormat: time.Kitchen,
			Level:      level,
		})

		if cfg.OTEL.Enabled {
			otelHandler := otelslog.NewHandler(
				cfg.OTEL.ServiceName,
				otelslog.WithSource(true),
				otelslog.WithLoggerProvider(global.GetLoggerProvider()),
			)

			handler = slogmulti.Fanout(
				stdoutHandler,
				otelHandler,
			)
		} else {
			handler = stdoutHandler
		}
	} else {
		// Production: JSON output + OTEL
		jsonHandler := slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
			AddSource: true,
			Level:     level,
		})

		if cfg.OTEL.Enabled {
			otelHandler := otelslog.NewHandler(
				cfg.OTEL.ServiceName,
				otelslog.WithSource(true),
				otelslog.WithLoggerProvider(global.GetLoggerProvider()),
			)

			handler = slogmulti.Fanout(
				jsonHandler,
				otelHandler,
			)
		} else {
			handler = jsonHandler
		}
	}

	logger := slog.New(handler)

	// Add service context to all logs
	logger = logger.With(
		slog.String("service", cfg.OTEL.ServiceName),
		slog.String("version", cfg.App.Version),
		slog.String("environment", cfg.App.Environment),
	)

	return logger
}

func newResource(ctx context.Context, cfg *config.Config) (*resource.Resource, error) {
	return resource.New(
		ctx,
		resource.WithFromEnv(), // Pull from OTEL_RESOURCE_ATTRIBUTES
		resource.WithHost(),
		resource.WithContainer(),
		resource.WithProcess(),
		resource.WithOS(),
		resource.WithAttributes(
		// Service attributes
		// semconv.ServiceNameKey.String(cfg.OTEL.ServiceName),
		// semconv.ServiceVersionKey.String(cfg.OTEL.Version),
		// semconv.DeploymentEnvironmentKey.String(cfg.OTEL.Environment),
		),
	)
}

// Shutdown gracefully shuts down all telemetry providers
func (tp *TracerProvider) Shutdown(ctx context.Context) error {
	if tp.TracerProvider == nil {
		return nil
	}
	return tp.TracerProvider.Shutdown(ctx)
}

func (mp *MeterProvider) Shutdown(ctx context.Context) error {
	if mp.MeterProvider == nil {
		return nil
	}
	return mp.MeterProvider.Shutdown(ctx)
}

func (lp *LoggerProvider) Shutdown(ctx context.Context) error {
	if lp.LoggerProvider == nil {
		return nil
	}
	return lp.LoggerProvider.Shutdown(ctx)
}
