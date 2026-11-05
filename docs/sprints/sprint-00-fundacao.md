# Sprint 0 — Fundação

**Foco:** setup. **Specs:** —  
**Entrega da spec original:** projeto, Supabase, migrations, RLS, CI, deploy.

O app React, o tema verde e os componentes base **já existem**. Não recriar o front.

## Checklist

- [x] Projeto front (Vite + React + TypeScript)
- [x] Node 24 e npm
- [x] Tema verde e componentes base (botão, cartão, etiqueta, barra inferior)
- [x] Migrations: cadastros, membros_cadastro, matrizes, reprodutores, inseminadores, lotes, inseminacoes (`supabase/migrations/`)
- [x] Regras RLS por cadastro_id (roteiro de teste em `supabase/tests/rls_isolamento.sql`)
- [x] Pastas em camadas em `src/features/` (telas atuais ainda em `src/pages/`)
- [x] Vitest e testes do domain (`src/features/inseminacoes/domain/`)
- [x] Pipeline de CI: lint, testes e build (`.github/workflows/ci.yml`)
- [ ] Projeto Supabase remoto linkado e migration aplicada (`docs/supabase.md`)
- [ ] Deploy no Cloudflare Pages (inseminaai.codenes.com.br) — ver `docs/deploy-cloudflare.md`
