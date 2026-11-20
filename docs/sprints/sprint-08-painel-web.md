# Sprint 08 — Web IHB: cadastros (autônomo) + usuários

**Specs:** SPEC-20, SPEC-21  
**Pré-requisito:** E2E mobile mockado.

## Visão (complemento do produto)

Versão **web** do Insemina aí, com funções **a mais** que o mobile:

1. **Cadastro de empresa/cadastro** — MVP: só **autônomo** (Vitor = o cadastro inteiro).
2. **Cadastro de usuários** — no cadastro já existente (funcionários quando existir tipo empresa).

Mobile: **intocado** (inseminador no curral).

## Ordem sugerida

### Fundação

- [x] Papel **administrador geral** (`users.plataforma_admin`) no seed.
- [x] Migration `users.ativo`; login rejeita inativo.
- [x] Migration `cadastros.tipo` (`autonomo` \| `empresa`, default `autonomo`).

### Shell web

- [x] `src/pages/web/`, `WebShell`, rotas `/web/cadastros`.
- [ ] Guardas: geral vs admin do cadastro.

### SPEC-21 — Autônomo (prioridade negócio)

- [x] `GET/POST /api/plataforma/cadastros` — cria cadastro autônomo + 1º admin.
- [x] UI `/web/cadastros` (lista) + **novo autônomo**.
- [ ] Teste: novo usuário loga e vê cadastro vazio no mobile.

### SPEC-20 — Usuários no cadastro

- [x] API `/api/cadastro/membros` (listar, criar, ativar/desativar).
- [x] UI `/web/usuarios` (criar inseminador / administrador).
- [x] Login responsivo: fundo full width + ondas no desktop (conteúdo centralizado 480px).

## Futuro (não nesta sprint)

- Tipo **empresa**, holde/visão agregada, tela por funcionário.
- Permissões finas, planos, troca de e-mail, esqueci senha.

## Pronto quando

- Admin geral cria autônomo Vitor; Vitor usa `/entrar` no celular.
- Admin do cadastro adiciona outro login no mesmo tenant.
- Mobile sem regressão visual em `/entrar` e `/inicio`.