# SPEC-17 — Documentação pública, termos, changelog

**Objetivo:** substituir stubs de `/termos`, `/privacidade`, `/docs` por conteúdo real (LGPD, stack, deploy).

## Critérios de aceite

- Páginas legais completas (produto **Insemina aí**, não cópia do IHB)
- `/docs` com índice (stack, arquitetura, banco Neon, CI/CD, API quando existir)
- Changelog público alinhado a releases

## Implementação

- `src/pages/public/TermosPage.tsx`
- `src/pages/public/PrivacidadePage.tsx`
- `src/pages/public/DocsOverviewPage.tsx`
- Layout compartilhado: `PublicArticle.tsx` + `PublicSiteChrome`

## Estado atual

**Concluída (2026-11-20).** Textos em português do Brasil; contato LGPD `privacidade@codenes.com.br`. Revisão jurídica formal e alinhamento a planos comerciais ficam no polimento (sprint 6).