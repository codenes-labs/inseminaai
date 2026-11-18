# SPEC-15 — Worker, API no Vite, deploy

**Objetivo:** Cloudflare Worker serve SPA + `/api/*` no host `inseminaai.codenes.com.br`.

## Critérios de aceite (a detalhar na implementação P4)

- `vite-api-handler` / `create-api-handler` (padrão IHB)
- `wrangler deploy` (substituir modelo Pages legado)
- Assets estáticos e fallback SPA

## Estado atual

**Implementado:** `worker/index.ts`, `wrangler.toml` (assets + SPA fallback + `nodejs_compat`), deploy via `deploy.yml`.