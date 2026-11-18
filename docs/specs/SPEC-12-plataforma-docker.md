# SPEC-12 — Plataforma dev (Docker, Dev Container, health)

**Objetivo:** dev local com Postgres **exclusivo** do Insemina aí, Dev Container funcional e contrato inicial de `GET /api/health`.

**Plano detalhado (revisar antes de codar):** `docs/plano-dev-container-p1.md`.

**Referência IHB:** SPEC-09, `.docker/`, `.devcontainer/`.

## Regras

- Compose **não** reutiliza Postgres nem `.env` do In House Bank (decisão §6 #2).
- Node **22**; Postgres **17** (`postgres:17-bookworm`).
- Produção continua **Neon** (fora do compose).
- Portas padrão: Vite **5173**; Postgres **5434** no host (serviço `db`, interno 5432).

## Critérios de aceite

1. `.docker/docker-compose.dev.yaml`, `.docker/Dockerfile.dev`, `.docker/.env.example`, `.devcontainer/devcontainer.json`, `Makefile` com `docker-dev` / `docker-dev-down`.
2. Volume Docker dedicado (`inseminaai_postgres_data` ou nome equivalente documentado).
3. `DATABASE_URL` para serviço `db` dentro da rede compose; variante `localhost:5434` documentada para host.
4. Dev Container: `postCreate` com `npm ci`; Vite sobe via `start-dev-server.sh` e fica acessível na porta publicada.
5. `GET /api/health` — status 200, JSON com flags booleanas (`configured`, `database`, `jwt`); teste de integração leve no handler (padrão IHB; health não consulta banco na v1).
6. README: primeiro dia (copiar `.env`, abrir container ou `make docker-dev`).
7. `npm test`, `npm run lint`, `npm run build` passam no host **sem** Docker no CI.

## Testes

- Integração: `GET /api/health` via handler (quando existir).
- Domain existente: mantidos; nenhum teste exige Supabase.

## Fora de escopo (P1)

- Auth JWT completo (SPEC-13), migrations aplicadas no banco (SPEC-14), Prometheus/Grafana, k6 no CI.

## Estado atual

**Implementado** (2026-11-17): `.docker/`, `.devcontainer/`, `Makefile`, `GET /api/health`, testes em `health.integration.spec.ts`. Próximo: **SPEC-13** (auth JWT).