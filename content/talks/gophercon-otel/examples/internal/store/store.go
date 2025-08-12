package store

import (
	"context"
	"fmt"
	"time"

	"github.com/exaring/otelpgx"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/codes"

	"github.com/hmajid2301/user-service/internal/config"
	"github.com/hmajid2301/user-service/internal/errors"
)

type User struct {
	ID      int    `json:"id"`
	Name    string `json:"name"`
	Email   string `json:"email"`
	Premium bool   `json:"premium"`
	Created string `json:"created"`
}

type Store struct {
	pool   *pgxpool.Pool
	config *config.Config
}

func New(ctx context.Context, cfg *config.Config) (*Store, error) {
	ctx, span := otel.Tracer(cfg.OTEL.ServiceName).Start(ctx, "Store.New")
	defer span.End()

	pool, err := newPool(ctx, cfg)
	if err != nil {
		span.SetStatus(codes.Error, "failed to create database pool")
		span.RecordError(err)
		return nil, fmt.Errorf("failed to create database pool: %w", err)
	}

	store := &Store{
		pool:   pool,
		config: cfg,
	}

	// Test connection
	if err := store.ping(ctx); err != nil {
		span.SetStatus(codes.Error, "failed to ping database")
		span.RecordError(err)
		pool.Close()
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	// Initialize database schema
	if err := store.initSchema(ctx); err != nil {
		span.SetStatus(codes.Error, "failed to initialize schema")
		span.RecordError(err)
		pool.Close()
		return nil, fmt.Errorf("failed to initialize schema: %w", err)
	}

	span.SetAttributes(
		attribute.String("database.status", "connected"),
		attribute.Int("database.max_conns", cfg.Database.MaxOpenConns),
	)

	return store, nil
}

func newPool(ctx context.Context, cfg *config.Config) (*pgxpool.Pool, error) {
	pgxConfig, err := pgxpool.ParseConfig(cfg.Database.URL)
	if err != nil {
		return nil, fmt.Errorf("failed to parse database URL: %w", err)
	}

	// Configure connection pool settings
	pgxConfig.MaxConns = int32(cfg.Database.MaxOpenConns)
	pgxConfig.MinConns = int32(cfg.Database.MaxIdleConns)
	pgxConfig.MaxConnLifetime = cfg.Database.ConnMaxLifetime
	pgxConfig.MaxConnIdleTime = cfg.Database.ConnMaxIdleTime

	// Add OpenTelemetry tracing if enabled
	if cfg.OTEL.Enabled {
		pgxConfig.ConnConfig.Tracer = otelpgx.NewTracer(
			otelpgx.WithTrimSQLInSpanName(),
			otelpgx.WithIncludeQueryParameters(),
		)
	}

	// Configure connection settings for production
	pgxConfig.ConnConfig.ConnectTimeout = 10 * time.Second
	pgxConfig.ConnConfig.RuntimeParams = map[string]string{
		"application_name": cfg.OTEL.ServiceName,
		"timezone":         "UTC",
	}

	pool, err := pgxpool.NewWithConfig(ctx, pgxConfig)
	if err != nil {
		return nil, fmt.Errorf("failed to create connection pool: %w", err)
	}

	return pool, nil
}

func (s *Store) initSchema(ctx context.Context) error {
	ctx, span := otel.Tracer(s.config.OTEL.ServiceName).Start(ctx, "Store.InitSchema")
	defer span.End()

	// Create users table with proper constraints and indexes
	query := `
		CREATE TABLE IF NOT EXISTS users (
			id SERIAL PRIMARY KEY,
			name VARCHAR(100) NOT NULL CHECK (length(trim(name)) >= 2),
			email VARCHAR(254) UNIQUE NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
			premium BOOLEAN DEFAULT FALSE NOT NULL,
			created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
			updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
		);

		-- Indexes for performance
		CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
		CREATE INDEX IF NOT EXISTS idx_users_premium ON users(premium) WHERE premium = true;
		CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

		-- Function to update updated_at timestamp
		CREATE OR REPLACE FUNCTION update_updated_at_column()
		RETURNS TRIGGER AS $$
		BEGIN
			NEW.updated_at = NOW();
			RETURN NEW;
		END;
		$$ language 'plpgsql';

		-- Trigger to automatically update updated_at
		DROP TRIGGER IF EXISTS update_users_updated_at ON users;
		CREATE TRIGGER update_users_updated_at
			BEFORE UPDATE ON users
			FOR EACH ROW
			EXECUTE FUNCTION update_updated_at_column();
	`

	_, err := s.pool.Exec(ctx, query)
	if err != nil {
		span.SetStatus(codes.Error, "failed to create schema")
		span.RecordError(err)
		return fmt.Errorf("failed to create schema: %w", err)
	}

	span.SetAttributes(attribute.String("schema.status", "initialized"))
	return nil
}

func (s *Store) GetUser(ctx context.Context, id int) (*User, error) {
	ctx, span := otel.Tracer(s.config.OTEL.ServiceName).Start(ctx, "Store.GetUser")
	defer span.End()

	span.SetAttributes(
		attribute.Int("user.id", id),
		attribute.String("db.operation", "SELECT"),
		attribute.String("db.table", "users"),
	)

	query := `
		SELECT id, name, email, premium, created_at
		FROM users
		WHERE id = $1
	`

	var user User
	var createdAt time.Time

	err := s.pool.QueryRow(ctx, query, id).Scan(
		&user.ID,
		&user.Name,
		&user.Email,
		&user.Premium,
		&createdAt,
	)

	if err != nil {
		if err == pgx.ErrNoRows {
			span.SetAttributes(attribute.String("user.status", "not_found"))
			return nil, errors.ErrUserNotFound
		}

		span.SetStatus(codes.Error, "database query failed")
		span.RecordError(err)
		return nil, errors.NewInternalError(fmt.Errorf("failed to get user: %w", err))
	}

	user.Created = createdAt.Format(time.RFC3339)

	span.SetAttributes(
		attribute.String("user.email", user.Email),
		attribute.Bool("user.premium", user.Premium),
		attribute.String("user.status", "found"),
	)

	return &user, nil
}

func (s *Store) CreateUser(ctx context.Context, name, email string) (*User, error) {
	ctx, span := otel.Tracer(s.config.OTEL.ServiceName).Start(ctx, "Store.CreateUser")
	defer span.End()

	span.SetAttributes(
		attribute.String("user.name", name),
		attribute.String("user.email", email),
		attribute.String("db.operation", "INSERT"),
		attribute.String("db.table", "users"),
	)

	query := `
		INSERT INTO users (name, email, premium, created_at, updated_at)
		VALUES ($1, $2, FALSE, NOW(), NOW())
		RETURNING id, name, email, premium, created_at
	`

	var user User
	var createdAt time.Time

	err := s.pool.QueryRow(ctx, query, name, email).Scan(
		&user.ID,
		&user.Name,
		&user.Email,
		&user.Premium,
		&createdAt,
	)

	if err != nil {
		// Check for unique constraint violation (duplicate email)
		if pgErr, ok := err.(*pgconn.PgError); ok {
			if pgErr.Code == "23505" && pgErr.ConstraintName == "users_email_key" {
				span.SetAttributes(attribute.String("error.type", "duplicate_email"))
				return nil, errors.ErrDuplicateEmail
			}
		}

		span.SetStatus(codes.Error, "failed to create user")
		span.RecordError(err)
		return nil, errors.NewInternalError(fmt.Errorf("failed to create user: %w", err))
	}

	user.Created = createdAt.Format(time.RFC3339)

	span.SetAttributes(
		attribute.Int("user.id", user.ID),
		attribute.String("user.status", "created"),
	)

	return &user, nil
}

func (s *Store) UpgradeToPremium(ctx context.Context, id int) (*User, error) {
	ctx, span := otel.Tracer(s.config.OTEL.ServiceName).Start(ctx, "Store.UpgradeToPremium")
	defer span.End()

	span.SetAttributes(
		attribute.Int("user.id", id),
		attribute.String("db.operation", "UPDATE"),
		attribute.String("db.table", "users"),
		attribute.String("operation", "upgrade_premium"),
	)

	// Use a transaction to ensure consistency
	tx, err := s.pool.Begin(ctx)
	if err != nil {
		span.SetStatus(codes.Error, "failed to begin transaction")
		span.RecordError(err)
		return nil, errors.NewInternalError(fmt.Errorf("failed to begin transaction: %w", err))
	}
	defer tx.Rollback(ctx)

	// First check if user exists and is not already premium
	var currentPremium bool
	checkQuery := `SELECT premium FROM users WHERE id = $1 FOR UPDATE`
	err = tx.QueryRow(ctx, checkQuery, id).Scan(&currentPremium)
	if err != nil {
		if err == pgx.ErrNoRows {
			span.SetAttributes(attribute.String("user.status", "not_found"))
			return nil, errors.ErrUserNotFound
		}
		span.SetStatus(codes.Error, "failed to check user status")
		span.RecordError(err)
		return nil, errors.NewInternalError(fmt.Errorf("failed to check user status: %w", err))
	}

	if currentPremium {
		span.SetAttributes(attribute.String("user.status", "already_premium"))
		// User is already premium, just return current data
		var user User
		var createdAt time.Time
		selectQuery := `SELECT id, name, email, premium, created_at FROM users WHERE id = $1`
		err = tx.QueryRow(ctx, selectQuery, id).Scan(&user.ID, &user.Name, &user.Email, &user.Premium, &createdAt)
		if err != nil {
			span.SetStatus(codes.Error, "failed to get user data")
			span.RecordError(err)
			return nil, errors.NewInternalError(fmt.Errorf("failed to get user data: %w", err))
		}
		user.Created = createdAt.Format(time.RFC3339)
		tx.Commit(ctx)
		return &user, nil
	}

	// Update user to premium
	updateQuery := `
		UPDATE users
		SET premium = TRUE, updated_at = NOW()
		WHERE id = $1
		RETURNING id, name, email, premium, created_at
	`

	var user User
	var createdAt time.Time

	err = tx.QueryRow(ctx, updateQuery, id).Scan(
		&user.ID,
		&user.Name,
		&user.Email,
		&user.Premium,
		&createdAt,
	)

	if err != nil {
		span.SetStatus(codes.Error, "failed to upgrade user")
		span.RecordError(err)
		return nil, errors.NewInternalError(fmt.Errorf("failed to upgrade user: %w", err))
	}

	// Commit transaction
	if err := tx.Commit(ctx); err != nil {
		span.SetStatus(codes.Error, "failed to commit transaction")
		span.RecordError(err)
		return nil, errors.NewInternalError(fmt.Errorf("failed to commit transaction: %w", err))
	}

	user.Created = createdAt.Format(time.RFC3339)

	span.SetAttributes(
		attribute.Bool("user.premium", user.Premium),
		attribute.String("user.status", "upgraded"),
	)

	return &user, nil
}

func (s *Store) Ping(ctx context.Context) error {
	return s.ping(ctx)
}

func (s *Store) ping(ctx context.Context) error {
	ctx, span := otel.Tracer(s.config.OTEL.ServiceName).Start(ctx, "Store.Ping")
	defer span.End()

	// Use a short timeout for health checks
	pingCtx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	err := s.pool.Ping(pingCtx)
	if err != nil {
		span.SetStatus(codes.Error, "database ping failed")
		span.RecordError(err)
		return errors.ErrDatabaseConnection
	}

	span.SetAttributes(attribute.String("database.status", "healthy"))
	return nil
}

func (s *Store) Stats() *pgxpool.Stat {
	return s.pool.Stat()
}

func (s *Store) Close() {
	if s.pool != nil {
		s.pool.Close()
	}
}
