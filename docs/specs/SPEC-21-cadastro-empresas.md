# SPEC-21 — Cadastro de empresas (cadastros) na web

**Objetivo:** na **versão web** (estilo In House Bank), permitir **provisionar novos clientes** na plataforma: criar um **cadastro** (empresa/tenant) e o **primeiro acesso**. Foco inicial: **autônomo** (a “empresa” é a própria pessoa, ex.: Vitor Bezerra inseminador).

**Relacionamento:** SPEC-20 cobre login web responsivo e **usuários dentro de um cadastro já existente**. SPEC-21 cobre **criar o cadastro** + primeiro login. Mobile do app de campo permanece intocado.

## Modelo de negócio

| Conceito | No banco hoje | Significado |
| --- | --- | --- |
| Empresa / cliente | `cadastros` | Espaco isolado de dados (`cadastro_id`) |
| Pessoa com login | `users` + `membros_cadastro` | E-mail/senha + vínculo e papel |
| Autônomo | `cadastros` tipo **autônomo** | Um cadastro = uma pessoa profissional (nome do cadastro = nome do autônomo ou marca) |
| Empresa (futuro) | `cadastros` tipo **empresa** | Um cadastro = firma; vários logins (funcionários); visão consolidada do “todo” |

**MVP desta spec:** só `tipo = autonomo`. Campo e UI para `empresa` ficam preparados na spec, implementação depois.

## Quem pode provisionar

- **Administrador geral da plataforma** (IHB-style): usuário com flag ou papel fora do tenant (ex.: seed `admin@codenes.com.br`), acessando rotas `/web/...`.
- **Não** há auto-cadastro público (`/cadastro` off em produção).
- Administrador **de um cadastro** (SPEC-20) cria **membros** só **dentro** do próprio `cadastro_id`, não cria tenant novo.

## Fluxo MVP — autônomo (ex.: Vitor)

1. Admin geral abre **Novo cadastro (autônomo)** na web.
2. Informa: **nome do cadastro** (ex. “Vitor Bezerra”), **plano** (default `gratuito`), **e-mail e senha do primeiro usuário**, nome do usuário.
3. Sistema cria em transação: `cadastros` (tipo autônomo) + `users` + `membros_cadastro` (papel **administrador**).
4. Vitor entra em `/entrar` e usa o **mesmo app mobile** (matrizes, IA, etc.) — dados já sob o `cadastro_id` dele.

## Critérios de aceite (MVP autônomo)

- Rota web protegida: ex. `/web/cadastros/novo` ou wizard em `/web/cadastros` — **apenas administrador geral**.
- Formulário: nome do cadastro, e-mail (único), nome do usuário, senha inicial; `tipo` fixo ou hidden `autonomo`.
- Listagem opcional na v1: `/web/cadastros` — nome, tipo, ativa, plano, data.
- `cadastros.ativa = false` impede login de qualquer membro daquele tenant (complementar `users.ativo` da SPEC-20).
- Toda criação auditável (sem expor senha em log).
- Testes: tenant A não aparece na listagem do admin B (se houver mais de um super-admin no futuro); e-mail duplicado falha.

## Banco — evolução planejada

| Campo | Tabela | MVP |
| --- | --- | --- |
| `tipo` | `cadastros` | `text` check (`autonomo`, `empresa`) — default `autonomo` |
| `ativa` | já existe | usada para bloquear tenant |
| (futuro) CNPJ, razão social | `cadastros` | só tipo `empresa` |

Migration em `.docker/db/migrations/` quando implementar; atualizar `docs/banco.md`.

## Fase futura — tipo empresa (fora do MVP SPEC-21)

- Escolher **autônomo** vs **empresa** no formulário.
- Empresa: dono/administrador do cadastro cadastra **funcionários** (SPEC-20), cada um com login; app mobile pode variar por papel (só tela específica — **sem** definir agora).
- “Holde” / visão do conjunto: relatórios e dashboard **do cadastro inteiro** para admin da empresa (aproveita dados já filtrados por `cadastro_id`).

## API (proposta)

| Método | Rota | Quem |
| --- | --- | --- |
| `GET` | `/api/plataforma/cadastros` | administrador geral |
| `POST` | `/api/plataforma/cadastros` | administrador geral (body: tipo, nome, primeiro usuário) |
| `PATCH` | `/api/plataforma/cadastros/:id` | administrador geral (ativa/desativa, plano) |

Prefixo `/api/plataforma/*` para não confundir com APIs do tenant (`/api/matrizes`, etc.).

## Identificar administrador geral

**Aguardando confirmação na implementação.** Opções alinhadas ao IHB:

- coluna `users.plataforma_admin boolean`, ou
- cadastro “sistema” fixo no seed, ou
- lista de e-mails em secret (evitar se possível).

Documentar a escolha em SPEC-13 ao implementar.

## Testes

- Domínio: payload de provisionamento autônomo válido/inválido.
- Integração: `POST` cria cadastro + usuário; login do novo usuário retorna `cadastro_id` correto.
- Isolamento: novo cadastro vazio não enxerga matrizes de outros.

## Estado atual

**Em implementação (2026-11-20):** migration `users.ativo`, `plataforma_admin`, `cadastros.tipo`; API `GET/POST /api/plataforma/cadastros`; tela `/web/cadastros` (admin geral). Pendente: membros no tenant (SPEC-20), tipo empresa.