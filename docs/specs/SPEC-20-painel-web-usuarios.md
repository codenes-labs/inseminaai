# SPEC-20 — Painel web, login desktop e gestão de usuários

**Objetivo:** camada **web (desktop)** com login equivalente ao mobile e **gestão de logins** no `cadastro_id` atual, no espírito do In House Bank. O app de campo (`/inicio`, matrizes, etc.) **permanece intocado** salvo pedido explícito.

**Complemento:** criar **novo cliente na plataforma** (cadastro autônomo, ex. Vitor) está na **SPEC-21**. Esta spec é “dentro do tenant”: listar/criar/desativar membros.

## Princípio inegociável

- App de campo (`AppShell`, `max-w-[480px]`) **não é alterado** nesta spec.
- **Login:** **mesma rota** `/entrar`; mobile = layout atual; **desktop** = layout adaptado (mesmos campos e API).
- Painel: rotas novas em `/web/...`.
- Mesma sessão JWT (`entrarComSenha`).

## Público

| Papel | Web |
| --- | --- |
| **administrador** (do cadastro) | `/web/usuarios` — criar inseminadores/funcionários **no mesmo** `cadastro_id` |
| **inseminador** | Só app mobile; após login → `/inicio` |
| **administrador geral** (plataforma) | SPEC-21 (`/web/cadastros`) + pode usar as mesmas telas web |

## Rotas (proposta)

| Rota | Função |
| --- | --- |
| `/entrar` | Login responsivo |
| `/web/usuarios` | Membros do cadastro atual (**foco**) |
| `/web/cadastros` | SPEC-21 — provisionar autônomo |

## Login responsivo — critérios

- **Conteúdo (formulário):** permanece **centralizado** e com a mesma hierarquia do mobile (ícone verde, logo, campos, botão, textos). Largura útil ~`max-w-[480px]` centralizada na tela — **sem** redesenhar cards nem tipografia mobile.
- **Mobile (≤480px):** pixel a pixel igual ao atual (incluindo `max-w-[480px]` no container do formulário).
- **Desktop:** só o **fundo decorativo** preenche a viewport:
  - Gradiente verde claro (`.bg-login`) em **largura total** da janela.
  - Rodapé: componente `OndasOvelha` — **ondas/capim** esticam em largura total (`preserveAspectRatio="none"`); **vaquinha** permanece **no mesmo canto** (direita), sem se mover; apenas as ondas crescem horizontalmente.
  - Sem segunda coluna, sem layout de “painel split” no login.
- Pós-login: `inseminador` → `/inicio`; `administrador` em viewport largo → `/web/usuarios` (ajustável).
- Hook `useEntrar` compartilhado.
- Implementação sugerida: wrapper externo `min-h-screen w-full bg-login`; coluna interna `mx-auto max-w-[480px]`; ondas em camada `fixed`/`absolute` `inset-x-0 bottom-0` com SVG full width.

## Gestão de usuários (dentro do cadastro)

### Listar / criar / desativar

- Criar: nome, e-mail, senha inicial, papel (`administrador` \| `inseminador`).
- Desativar: `users.ativo` (migration SPEC-20) + login bloqueado.
- Apenas **administrador** do cadastro; RLS por `cadastro_id`.

### API (tenant)

| Método | Rota |
| --- | --- |
| `GET` | `/api/cadastro/membros` |
| `POST` | `/api/cadastro/membros` |
| `PATCH` | `/api/cadastro/membros/:userId` |

## Fora de escopo

- Permissões por matriz/tela.
- Tipo empresa com múltiplos perfis (SPEC-21 futuro).
- Alterar telas mobile.

## Testes

- 403 inseminador em `POST /api/cadastro/membros`.
- Isolamento entre cadastros.
- Domínio: validação de senha e e-mail.

## Estado atual

**Planejado (2026-11-20).** Sprint `sprint-08-painel-web.md`; SPEC-21 em paralelo para **cadastro autônomo**.