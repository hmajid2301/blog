# GopherCon OTEL Demo

.PHONY: up down logs test-requests help

help: ## Show available commands
	@echo 'Usage: make [target]'
	@echo 'Targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-12s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

up: ## Start the LGTM stack and example service
	docker-compose up -d
	@echo "Services starting..."
	@echo "  - User Service: http://localhost:8080"
	@echo "  - Grafana: http://localhost:3000 (admin/admin)"
	@echo "  - Alloy UI: http://localhost:12345"

down: ## Stop all services
	docker-compose down -v

logs: ## Show service logs
	docker-compose logs -f user-service

test-requests: ## Send test requests to generate telemetry
	@echo "Sending test requests..."
	@for i in {1..10}; do \
		curl -s http://localhost:8080/user/$$i > /dev/null; \
		curl -s http://localhost:8080/user/999 > /dev/null; \
		sleep 0.5; \
	done
	@echo "Test requests complete. Check Grafana for telemetry data."