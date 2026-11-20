# Deploy Cloudflare Worker

## Fluxo

1. Push em `master` dispara `.github/workflows/deploy.yml`.
2. Jobs: lint → coverage → build (`dist/`) → deploy com Wrangler.
3. Antes do Worker: `npm run db:setup` (migrations em `.docker/db/migrations/` + seed admin/demo no Neon).
4. Secrets do GitHub são enviados ao Worker (`wrangler secret bulk`).

`TURNSTILE_SITE_KEY` precisa existir no **build** (`VITE_TURNSTILE_SITE_KEY` no bundle). Se o Worker tiver `TURNSTILE_SECRET_KEY` mas o front sair sem site key, o login responde *“Confirme o captcha antes de entrar.”* sem exibir o widget.

## Secrets no GitHub (Actions)

| Secret | Uso |
| --- | --- |
| `DATABASE_URL` | Neon (Worker + `db:setup` no CI) |
| `JWT_SECRET` | ≥ 32 caracteres (Worker) |
| `TURNSTILE_SECRET_KEY` | Verificação no `POST /api/auth/sign-in` |
| `TURNSTILE_SITE_KEY` | Build (`VITE_TURNSTILE_SITE_KEY`) + Worker |
| `CLOUDFLARE_API_TOKEN` | Org — deploy |
| `CLOUDFLARE_ACCOUNT_ID` | Org — deploy |

## Local

```bash
npm run build
npx wrangler deploy
```

Antes: `wrangler secret put DATABASE_URL` e `JWT_SECRET` (e Turnstile, se usar captcha em prod).

## Domínio

Alvo: `inseminaai.codenes.com.br` (custom domain no painel Cloudflare, ligado ao Worker `inseminaai`).

## Health

`GET /api/health` → `configured`, `database_ok`, `jwt`.

## Neon: roles

| Role | Onde |
| --- | --- |
| `inseminaai_app` | Criado na migration; a API faz `SET ROLE` para RLS |
| `inseminaai_user` | Usuário de conexão em produção (connection string) |
| `inseminaai` | Só no Postgres do Docker (compose) |

O secret `DATABASE_URL` deve apontar para um **usuário que exista** no Neon (em geral `inseminaai_user` ou o owner `neondb_owner`). O passo *Migrations e seed* precisa de permissão para criar tabelas/roles — se `inseminaai_user` não tiver, use a connection string do **owner** no secret até o schema estar criado.

A migration `20251120100000_grant_inseminaai_user.sql` concede `inseminaai_app` ao `inseminaai_user` quando esse role existir (útil se o CI migrar como owner e o Worker conectar como `inseminaai_user`).

### Pooled vs direct (importante)

A API usa `SET LOCAL ROLE inseminaai_app` + `app.cadastro_id` em cada transação (RLS). No Neon, o host **com `-pooler`** (connection pooling) **não suporta** bem esse tipo de `SET` — login e health passam, mas **`GET /api/matrizes`** (e outras rotas autenticadas) podem falhar.

| Uso | Connection pooling no Neon |
| --- | --- |
| Secret `DATABASE_URL` (Worker + mesmo URL no CI, se quiser um só) | **Desligado** (host **sem** `-pooler`) |
| Migrations no CI | Preferir **direct** também |

Depois de trocar a string, rode o deploy de novo (ou `wrangler secret bulk`) para o Worker pegar a URL nova.