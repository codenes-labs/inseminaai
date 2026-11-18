# Migrations PostgreSQL

SQL de referência do domínio **Insemina aí**. Em produção: **Neon**; em dev: Postgres no Docker (sprint P1+).

O arquivo `20251104200000_initial_schema.sql` é legado da época Supabase (`auth.users`, `auth.uid()`). A tradução para JWT + `users` do servidor entra na **SPEC-14**.

Roteiro manual de isolamento: `rls_isolamento.sql`.