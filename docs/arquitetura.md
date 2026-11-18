# Arquitetura

App web responsivo (PWA) para registro de inseminações no celular. Front-end e API no **Cloudflare Worker** (`inseminaai.codenes.com.br`). Dados em **PostgreSQL** (Neon em produção).

## O que já existe

O visual e as telas do app logado já foram feitos em **React + Vite + TypeScript + Tailwind**, mobile-first, identidade verde (`#2E9E5B`, `#14532D`, `#F7FAF5`). Esse design não se reescreve.

**Sprint 1 (2026-11-17):** rota pública `/` é **landing**. **P2 (2026-11-17):** telas do MVP roteadas com `RotaProtegida`; dados ainda mock até P3.

## Stack

- **Front-end:** React (Vite), TypeScript estrito, Tailwind, PWA
- **API e auth:** JWT, rotas `/api/*` (padrão In House Bank)
- **Banco:** PostgreSQL + RLS por `cadastro_id` (contexto setado no servidor)
- **Node 22**
- **Hospedagem:** Cloudflare Worker

## Rotas públicas (atual)

| Rota | Tela |
| --- | --- |
| `/` | Landing |
| `/entrar` | Login (JWT) |
| `/termos`, `/privacidade`, `/docs` | Stubs (conteúdo em SPEC-17) |

## Telas do app (design pronto — rotas ativas após login)

| Rota | Tela |
| --- | --- |
| `/inicio` | Dashboard |
| `/matrizes` | Lista |
| `/matrizes/:id` | Detalhe |
| `/matrizes/:id/diagnostico` | Diagnóstico |
| `/nova-inseminacao` | Nova inseminação |
| `/relatorios` | Relatórios |
| `/mais` | Configurações |

Dados de demonstração em `src/data/mock.ts`; auth JWT em `src/lib/auth.ts` + `src/server/auth/`; persistência real na P3.

## Camadas por feature

```
src/
  core/          cadastro_id, sessão (futuro)
  shared/        UI compartilhada (src/components)
  features/
    matrizes/{domain,application,infrastructure,presentation}
    inseminacoes/
    diagnosticos/
    lotes/
```

## Testes

| Tipo | Ferramenta | O que cobre |
| --- | --- | --- |
| Unitário | Vitest | Domínio e casos de uso |
| Componente | Testing Library | Telas (quando solicitado) |
| Segurança | SQL + app | RLS entre cadastros |
| Ponta a ponta | Playwright | Fluxos críticos (futuro) |