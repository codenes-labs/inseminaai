# SPEC-13 — Auth JWT, sessão, proteções

**Objetivo:** login e sessão no padrão In House Bank, multi-tenant por `cadastro_id`.

## Critérios de aceite (a detalhar na implementação P2)

- `/api/auth/*`, JWT HS256, idle 2 h, JWT 12 h
- Seed: admin `admin@codenes.com.br` / demo `teste@teste.com` (memória)
- Turnstile **opcional** até secret configurado
- Cadastro público **off** em produção; provisionamento pelo administrador geral
- Papéis MVP: **administrador** e **inseminador**

**Referência:** IHB SPEC-04, 13–15. Atualizar SPEC-01 antes de codar produto.

## Estado atual

**Implementado (P2):** `POST /api/auth/sign-in`, `GET /api/auth/session`, `POST /api/auth/sign-out`; JWT HS256 (12 h); seed em memória; conta **demo** marcada no token. Turnstile, rate limit, provisionamento admin e Postgres ficam para sprints seguintes.