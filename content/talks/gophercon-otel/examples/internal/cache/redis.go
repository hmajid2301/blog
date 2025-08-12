package cache

import (
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
	"time"

	"github.com/redis/go-redis/extra/redisotel/v9"
	"github.com/redis/go-redis/v9"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/codes"
	"go.opentelemetry.io/otel/trace"

	"github.com/hmajid2301/user-service/internal/config"
)

type RedisClient struct {
	client *redis.Client
	tracer trace.Tracer
}

func NewRedisClient(cfg *config.Config) (*RedisClient, error) {
	rdb := redis.NewClient(&redis.Options{
		Addr:     cfg.Redis.URL,
		Password: cfg.Redis.Password,
		DB:       cfg.Redis.DB,
	})

	// Add OpenTelemetry instrumentation
	if err := redisotel.InstrumentTracing(rdb); err != nil {
		return nil, fmt.Errorf("failed to instrument Redis tracing: %w", err)
	}

	if err := redisotel.InstrumentMetrics(rdb); err != nil {
		return nil, fmt.Errorf("failed to instrument Redis metrics: %w", err)
	}

	// Test connection
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := rdb.Ping(ctx).Err(); err != nil {
		return nil, fmt.Errorf("failed to connect to Redis: %w", err)
	}

	return &RedisClient{
		client: rdb,
		tracer: otel.Tracer("redis-client"),
	}, nil
}

func (r *RedisClient) Set(ctx context.Context, key string, value interface{}, expiration time.Duration) error {
	ctx, span := r.tracer.Start(ctx, "redis.set",
		trace.WithAttributes(
			attribute.String("redis.key", key),
			attribute.String("redis.operation", "SET"),
		),
	)
	defer span.End()

	data, err := json.Marshal(value)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, "failed to marshal value")
		return fmt.Errorf("failed to marshal value: %w", err)
	}

	if err := r.client.Set(ctx, key, data, expiration).Err(); err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, "redis set failed")
		slog.ErrorContext(ctx, "Redis SET failed",
			slog.String("key", key),
			slog.String("error", err.Error()),
		)
		return fmt.Errorf("redis set failed: %w", err)
	}

	span.SetAttributes(attribute.Int("redis.value_size", len(data)))
	slog.InfoContext(ctx, "Redis SET successful",
		slog.String("key", key),
		slog.Int("value_size", len(data)),
	)

	return nil
}

func (r *RedisClient) Get(ctx context.Context, key string, dest interface{}) error {
	ctx, span := r.tracer.Start(ctx, "redis.get",
		trace.WithAttributes(
			attribute.String("redis.key", key),
			attribute.String("redis.operation", "GET"),
		),
	)
	defer span.End()

	val, err := r.client.Get(ctx, key).Result()
	if err != nil {
		if err == redis.Nil {
			span.SetAttributes(attribute.Bool("redis.key_found", false))
			slog.InfoContext(ctx, "Redis key not found", slog.String("key", key))
			return fmt.Errorf("key not found: %s", key)
		}
		span.RecordError(err)
		span.SetStatus(codes.Error, "redis get failed")
		slog.ErrorContext(ctx, "Redis GET failed",
			slog.String("key", key),
			slog.String("error", err.Error()),
		)
		return fmt.Errorf("redis get failed: %w", err)
	}

	if err := json.Unmarshal([]byte(val), dest); err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, "failed to unmarshal value")
		return fmt.Errorf("failed to unmarshal value: %w", err)
	}

	span.SetAttributes(
		attribute.Bool("redis.key_found", true),
		attribute.Int("redis.value_size", len(val)),
	)
	slog.InfoContext(ctx, "Redis GET successful",
		slog.String("key", key),
		slog.Int("value_size", len(val)),
	)

	return nil
}

func (r *RedisClient) Delete(ctx context.Context, key string) error {
	ctx, span := r.tracer.Start(ctx, "redis.delete",
		trace.WithAttributes(
			attribute.String("redis.key", key),
			attribute.String("redis.operation", "DEL"),
		),
	)
	defer span.End()

	deleted, err := r.client.Del(ctx, key).Result()
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, "redis delete failed")
		slog.ErrorContext(ctx, "Redis DELETE failed",
			slog.String("key", key),
			slog.String("error", err.Error()),
		)
		return fmt.Errorf("redis delete failed: %w", err)
	}

	span.SetAttributes(attribute.Int64("redis.keys_deleted", deleted))
	slog.InfoContext(ctx, "Redis DELETE successful",
		slog.String("key", key),
		slog.Int64("keys_deleted", deleted),
	)

	return nil
}

func (r *RedisClient) Exists(ctx context.Context, key string) (bool, error) {
	ctx, span := r.tracer.Start(ctx, "redis.exists",
		trace.WithAttributes(
			attribute.String("redis.key", key),
			attribute.String("redis.operation", "EXISTS"),
		),
	)
	defer span.End()

	exists, err := r.client.Exists(ctx, key).Result()
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, "redis exists failed")
		return false, fmt.Errorf("redis exists failed: %w", err)
	}

	keyExists := exists > 0
	span.SetAttributes(attribute.Bool("redis.key_exists", keyExists))

	return keyExists, nil
}

func (r *RedisClient) Close() error {
	return r.client.Close()
}

// CacheUser caches a user object with a TTL
func (r *RedisClient) CacheUser(ctx context.Context, userID int64, user interface{}) error {
	key := fmt.Sprintf("user:%d", userID)
	return r.Set(ctx, key, user, 15*time.Minute)
}

// GetCachedUser retrieves a cached user
func (r *RedisClient) GetCachedUser(ctx context.Context, userID int64, dest interface{}) error {
	key := fmt.Sprintf("user:%d", userID)
	return r.Get(ctx, key, dest)
}

// InvalidateUser removes a user from cache
func (r *RedisClient) InvalidateUser(ctx context.Context, userID int64) error {
	key := fmt.Sprintf("user:%d", userID)
	return r.Delete(ctx, key)
}
