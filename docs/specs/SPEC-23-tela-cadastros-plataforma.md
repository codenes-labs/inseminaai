# SPEC-23 — Tela de cadastros da plataforma (admin geral)

**Objetivo:** uma única área em `/admin/cadastros` para provisionar clientes e gerir cadastros existentes, no estilo In House Bank.

**Relacionamento:** SPEC-21 (provisionar tenant), SPEC-22 (rotas `/admin/*`), regras de autônomo (um login) e cadastros seed protegidos.

## Layout

| Área | Conteúdo |
| --- | --- |
| Principal | Formulário **novo cadastro** (rota índice) ou **detalhe** do cliente selecionado (`/admin/cadastros/:id`) |
| Lateral (desktop) | Lista de cadastros existentes; clique abre o detalhe na área principal (sem seletor extra) |

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
- [x] Detalhe com editar, ativar/inativar, excluir e gestão de acessos conforme tipo.
- [x] Testes de domínio de provisionamento com `tipo`.
- [x] Persistência via `semContextoPlataforma` + migration `20251121140000_plataforma_cadastros_rls.sql`.

## Estado

**Implementado (2026-11-21).**