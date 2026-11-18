# SPEC-14 — Schema servidor e RLS `cadastro_id`

**Objetivo:** Postgres com `users`, `cadastros`, `membros_cadastro` e tabelas de domínio; RLS com contexto setado pelo servidor.

## Critérios de aceite (a detalhar na implementação P3)

- Traduzir `.docker/db/migrations/20251104200000_initial_schema.sql` (trocar `auth.users` / `auth.uid()`)
- Servidor define `cadastro_id` na transação (`current_setting`)
- Teste de isolamento conforme `.docker/db/migrations/rls_isolamento.sql`
- Neon **projeto novo** em produção

## Estado atual

Não implementado — sprint **P3**.