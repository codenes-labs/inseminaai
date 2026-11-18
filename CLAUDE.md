# Insemina aí

App web responsivo (PWA) para produtores e inseminadores registrarem inseminações, diagnósticos e repetições de matrizes bovinas, pelo celular. Nasce como laboratório para uso de uma pessoa e já é preparado para múltiplos clientes.

O design das telas já foi feito. Não redesenhar. Não trocar React por Angular. Não inventar requisito. Não fazer commit nem push sem pedido explícito.

## Stack

- Front-end: React (Vite), TypeScript estrito, Tailwind, PWA
- Banco: PostgreSQL (Neon em produção, Docker local); auth JWT + API `/api/*` (padrão In House Bank)
- Node **22**
- Hospedagem: Cloudflare **Worker** em inseminaai.codenes.com.br

## Como trabalhar

- Todo trabalho segue SDD. Leia `docs/principios.md` antes de qualquer tarefa.
- Specs em `docs/specs` e sprints em `docs/sprints`.
- Contexto de plataforma: `docs/planejamento-contexto-inicial.md`.
- Dúvida: perguntar. Não supor.

## Regras específicas

- Toda tabela de dados tem `cadastro_id`, e toda regra RLS filtra por ele.
- Todo usuário pertence a um cadastro pela tabela `membros_cadastro`.
- Mudança de banco entra em `.docker/db/migrations/` até existir `src/server/schema.ts` (SPEC-14).
- Regras de cálculo (tentativa, data do diagnóstico, previsão de parto) ficam no domain como funções puras.
- Cada feature tem as quatro camadas: domain, application, infrastructure, presentation.
- Interface para celular e uma mão: botões grandes, poucos campos, identidade verde já definida.
- Textos da interface em português do Brasil.

## Comandos

- Dev: `npm run dev`
- Testes: `npm test`
- Lint: `npm run lint`
- Build: `npm run build`