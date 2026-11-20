# Insemina aí

App para registro de inseminações bovinas. Specs em `docs/specs`, sprints em `docs/sprints`.

## Primeiro dia (Dev Container)

1. `make env-example` — cria `.docker/.env` a partir do exemplo.
2. No Cursor/VS Code: **Dev Containers → Reopen in Container** (Postgres **5434** no host; Vite **5173**).
3. Abra `http://localhost:5173` e teste `http://localhost:5173/api/health`.

Sem Dev Container:

```bash
make env-example
make docker-dev
```

## Banco (dev)

Com Postgres do compose no ar:

```bash
make db-setup
```

## Login (dev)

Em `/entrar`, com `JWT_SECRET` em `.docker/.env` (mín. 32 caracteres):

| Conta | E-mail | Senha |
| --- | --- | --- |
| Admin | `admin@codenes.com.br` | `CodenesTemp1` |
| Demo | `teste@teste.com` | `teste` |

O **admin** recebe dados de exemplo **no Postgres** (arquivo `.docker/db/seeds/admin_dev_catalog.sql`) ao rodar `make db-setup` ou `npm run db:seed`. O app não usa `mock.ts` nas telas logadas. A conta **demo** continua sem gravar no banco.

## Comandos

- `npm run dev` — Vite (lê `PORT_INTERNAL` e `.docker/.env` se existir)
- `make health` — `GET /api/health` (BASE_URL padrão `http://localhost:5173`)
- `npm test` / `npm run lint` / `npm run build`
- `make help` — atalhos Docker