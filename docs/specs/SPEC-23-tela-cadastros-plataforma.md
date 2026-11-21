# SPEC-23 — Tela de cadastros da plataforma (admin geral)

**Objetivo:** uma única área em `/admin/cadastros` para provisionar clientes e gerir cadastros existentes, no estilo In House Bank.

**Relacionamento:** SPEC-21 (provisionar tenant), SPEC-22 (rotas `/admin/*`), regras de autônomo (um login) e cadastros seed protegidos.

## Layout

| Rota | Conteúdo |
| --- | --- |
| `/admin/cadastros` (índice) | **Somente listagem** — sem item pré-selecionado e sem formulário |
| `/admin/cadastros/novo` | Formulário de **novo cadastro** (acessível pelo botão Novo) |
| `/admin/cadastros/:id` | **Detalhe** do cliente escolhido na lista |

### Listagem principal — ordenação, grid e busca

- **Ordenação:** cadastros seed **admin** e **demo** fixos no topo (favoritos), com ícone de estrela; demais em ordem alfabética por nome (`pt-BR`).
- **Exibição:** **lista numerada** (`<ol>`) na área principal — cada item mostra número, estrela (favoritos), nome, tipo, e-mail e status; **10** itens por página com Anterior/Próxima quando houver mais de uma página.
- **Busca:** campo com lupa; filtra por nome do cadastro ou e-mail de qualquer acesso (sem acentos, substring).
- **Domínio:** `listagem-cadastros-plataforma.ts` (ordenação, filtro, divisão grid/paginação).
- **API:** listagem inclui `emailLogin` e `emailsBusca` para pesquisa.

## Novo cadastro (índice)

Campos obrigatórios:

- Nome do cadastro
- Nome do usuário (primeiro login)
- E-mail
- Senha inicial — com botão **Gerar senha sugerida** (mesmo domínio `gerar-senha` do app)

Seletor de **tipo**: autônomo ou empresa.

Botão **Criar cadastro** — cria `cadastros` + primeiro `users` + `membros_cadastro` (papel administrador).

## Detalhe do cadastro

- **Editar** dados do cadastro: nome, tipo (autônomo ↔ empresa), salvar.
- **Ativar / inativar** o cadastro (`ativa`).
- **Excluir cliente** (exceto cadastros sistema admin/demo).
- **Acessos:**
  - **Autônomo:** um único login — editar, ativar/desativar, alterar senha; sem criar novos acessos nem excluir só o login.
  - **Empresa:** criar novos acessos com papel inseminador ou administrador; editar, ativar/desativar, excluir acesso.

## Regras de negócio (mantidas)

- `cadastroPermiteMultiplosAcessos`: só `empresa`.
- `cadastroProtegidoSistema` / `usuarioProtegidoSistema`: admin e demo do seed não excluem/desativam.
- E-mail único; senha inicial ≥ 8 caracteres.

## API

`POST /api/plataforma/cadastros` aceita `tipo` (`autonomo` | `empresa`), default `autonomo`.

Demais rotas já existentes (GET listagem, GET/PATCH/DELETE cadastro, CRUD membros).

## Critérios de aceite

- [x] Formulário novo com tipo, gerar senha e criar autônomo ou empresa.
- [x] Lista lateral sempre visível; item selecionado destacado.
- [x] Favoritos no topo com estrela; grid 10 + tabela paginada; busca por nome/e-mail.
- [x] Detalhe com editar, ativar/inativar, excluir e gestão de acessos conforme tipo.
- [x] Testes de domínio de provisionamento com `tipo`.
- [x] Persistência via `semContextoPlataforma` + migration `20251121140000_plataforma_cadastros_rls.sql`.

## Estado

**Implementado (2026-11-21).**