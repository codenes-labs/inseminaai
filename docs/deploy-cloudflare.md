# Deploy Cloudflare Worker

## Fluxo

1. Push em `master` dispara `.github/workflows/deploy.yml`.
2. Jobs: lint → coverage → build (`dist/`) → deploy com Wrangler.
3. Secrets do GitHub são enviados ao Worker (`wrangler secret bulk`).

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