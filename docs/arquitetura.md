# Arquitetura

App web responsivo (PWA) para registro de inseminações no celular. Front-end no Cloudflare (subdomínio de codenes.com.br). Dados no Supabase.

## O que já existe

O visual e as telas já foram feitos em **React + Vite + TypeScript + Tailwind**, mobile-first, identidade verde (`#2E9E5B`, `#14532D`, `#F7FAF5`). Esse design não se reescreve.

A spec original sugeria Angular. **Não vamos trocar a stack.** O complemento abaixo entra em cima do app atual: banco, auth real, regras, testes e as telas que ainda são mock.

## Stack

- **Front-end:** React (Vite), TypeScript estrito, Tailwind, PWA
- **Banco, login e segurança:** Supabase (Postgres, Auth, RLS)
- **Node 24 LTS** para ferramentas
- **Hospedagem:** Cloudflare Pages

## Telas (design atual)

Barra inferior: Início, Matrizes, Nova (centro), Relatórios. Cadastros no menu Mais.

| Rota | Tela |
| --- | --- |
| `/` | Login |
| `/inicio` | Dashboard |
| `/matrizes` | Lista |
| `/matrizes/:id` | Detalhe |
| `/matrizes/:id/diagnostico` | Diagnóstico |
| `/nova-inseminacao` | Nova inseminação |
| `/relatorios` | Relatórios |
| `/mais` | Configurações |

Hoje os dados vêm de `src/data/mock.ts` e o login é local (`src/lib/auth.ts`). Substituir mock por Supabase é trabalho das specs, sem mudar o visual.

## Camadas por feature

```
src/
  core/          cadastro_id, sessão
  shared/        UI compartilhada (já em src/components)
  features/
    matrizes/{domain,application,infrastructure,presentation}
    inseminacoes/
    diagnosticos/
    lotes/
```

Presentation = páginas atuais. Domain = funções puras de cálculo.

## Testes

| Tipo | Ferramenta | O que cobre |
| --- | --- | --- |
| Unitário | Vitest | Domínio e casos de uso, repositórios falsos |
| Componente | Testing Library | Telas e formulários |
| Segurança | SQL no Supabase | RLS entre cadastros |
| Ponta a ponta | Playwright | Login, nova inseminação, diagnóstico |
