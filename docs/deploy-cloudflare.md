# Deploy Cloudflare Pages

Build: `npm run build` → pasta `dist/`.

## GitHub (recomendado)

1. Repositório conectado em Cloudflare Pages.
2. Build command: `npm run build`
3. Output directory: `dist`
4. Node 24
5. Variáveis de ambiente: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

Domínio customizado: `inseminaai.codenes.com.br`.

## Wrangler (opcional)

`npx wrangler pages deploy dist --project-name=inseminaai`

Requer login `wrangler login` e projeto Pages criado no painel.
