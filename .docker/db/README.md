# Migrations PostgreSQL (dev)

SQL de referência do domínio **Insemina aí**. Em produção: **Neon**; em dev: Postgres no compose (serviço `db`).

O arquivo `migrations/20251104200000_initial_schema.sql` é legado Supabase (`auth.users`, `auth.uid()`). A tradução para JWT + `users` do servidor entra na **SPEC-14**.

Roteiro manual de isolamento: `migrations/rls_isolamento.sql`.