# Sprint P1 — Plataforma dev

**Specs:** SPEC-12  
**Plano:** `docs/plano-dev-container-p1.md` (portas **5173** / **5434**).

## Fase A — Planejamento

- [x] Plano Dev Container
- [x] Decisões §8 (Vite 5173, Postgres 5434, sem k6/git script, extensões mínimas)
- [x] SPEC-12 alinhada

## Fase B — Implementação

- [x] `.docker/` + volume `inseminaai_postgres_data`
- [x] `.devcontainer/` + `start-dev-server.sh`
- [x] `Makefile` (`docker-dev`, `health`, `env-example`)
- [x] `GET /api/health` + `health.integration.spec.ts`
- [x] README — primeiro dia
- [x] CI Node 22