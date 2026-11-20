# Migrations PostgreSQL (dev)

SQL de referência do domínio **Insemina aí**. Em produção: **Neon**; em dev: Postgres no compose (serviço `db`).

Schema traduzido (SPEC-14): `users` do servidor, RLS com `current_setting('app.cadastro_id')`.

```bash
make db-setup   # migrations + seed admin/demo
```

Catálogo de dev do **admin**: `seeds/admin_dev_catalog.sql` (INSERT no Postgres; regenere com `npx tsx scripts/generate-admin-seed-sql.ts` se alterar `src/server/db/seed-catalog.ts`).

Roteiro manual de isolamento: `migrations/rls_isolamento.sql`.