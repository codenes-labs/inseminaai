.DEFAULT_GOAL := help

BASE_URL ?= http://localhost:5173

COMPOSE_DEV := docker compose $(if $(wildcard .docker/.env),--env-file .docker/.env,) -f .docker/docker-compose.dev.yaml

.PHONY: help env-example docker-dev docker-dev-down dev test lint build health

help: ## Lista alvos disponíveis
	@grep -E '^[a-zA-Z0-9_-]+:.*##' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*## "}; {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'

env-example: ## Cria .docker/.env a partir do exemplo
	cp -n .docker/.env.example .docker/.env && echo "Criado .docker/.env — revise JWT_SECRET." || echo ".docker/.env já existe."

docker-dev: ## Compose dev (Vite na PORT_EXTERNAL, padrão 5173)
	$(COMPOSE_DEV) up --build

docker-dev-down: ## Para containers dev
	$(COMPOSE_DEV) down

dev: ## Vite no host (usa .docker/.env se existir)
	npm run dev

test: ## Vitest
	npm test

lint: ## ESLint
	npm run lint

build: ## tsc + vite build
	npm run build

health: ## curl GET /api/health (BASE_URL)
	curl -sS "$(BASE_URL)/api/health"

db-migrate: ## Aplica migrations (.docker/db/migrations)
	npm run db:migrate

db-seed: ## Seed admin + demo no Postgres
	npm run db:seed

db-setup: ## Migrations + seed
	npm run db:setup