package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/mux"
	"go.opentelemetry.io/contrib/instrumentation/github.com/gorilla/mux/otelmux"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"

	"github.com/hmajid2301/user-service/internal/config"
	"github.com/hmajid2301/user-service/internal/telemetry"
)

func main() {
	ctx := context.Background()
	cfg := config.Load()

	// Setup OpenTelemetry
	shutdown, err := telemetry.SetupOtel(ctx)
	if err != nil {
		log.Fatal(err)
	}
	defer shutdown(ctx)

	// Setup logger
	logger := telemetry.NewLogger()
	logger.InfoContext(ctx, "starting user service", "port", cfg.Port)

	// Setup HTTP router with OTEL middleware
	r := mux.NewRouter()
	r.Use(otelmux.Middleware("user-service"))

	// Routes
	r.HandleFunc("/user/{id}", userHandler).Methods("GET")
	r.HandleFunc("/health", healthHandler).Methods("GET")

	logger.InfoContext(ctx, "server listening", "port", cfg.Port)
	log.Fatal(http.ListenAndServe(":8080", r))
}

func userHandler(w http.ResponseWriter, r *http.Request) {
	ctx, span := otel.Tracer("user-service").Start(r.Context(), "get-user")
	defer span.End()

	userID := mux.Vars(r)["id"]
	span.SetAttributes(attribute.String("user.id", userID))

	logger := telemetry.NewLogger()
	logger.InfoContext(ctx, "processing user request", "user_id", userID)

	// Simulate database lookup
	time.Sleep(50 * time.Millisecond)

	// Return user data
	response := map[string]string{
		"id":   userID,
		"name": "John Doe",
		"role": "user",
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)

	logger.InfoContext(ctx, "user request completed", "user_id", userID)
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}