.DEFAULT_GOAL := help


.PHONY: help
help: ## Show this help.
	@fgrep -h "##" $(MAKEFILE_LIST) | fgrep -v fgrep | sed -e 's/\\$$//' | sed -e 's/##//'


.PHONY: build
build: ## Builds the Docker images needed by our app
	@docker compose build --ssh default --no-cache


.PHONY: start
start: build ## Starts the FastAPI web service
	@docker compose up


.PHONY: format
format: build ## Runs the code formatter
	@docker compose run --rm app black ./


.PHONY: test
test: build ## Runs the tests
	@docker compose run --rm app pytest
