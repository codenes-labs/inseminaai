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
| `DATABASE_URL` | Neon (Worker) |
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