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

- [ ] Papel **administrador geral** (plataforma) definido e testado no seed.
- [ ] Migration `users.ativo`; login rejeita inativo.
- [ ] Migration `cadastros.tipo` (`autonomo` \| `empresa`, default `autonomo`).

### Shell web

- [ ] `src/pages/web/`, `WebShell`, rotas `/web/*`.
- [ ] Guardas: geral vs admin do cadastro.

### SPEC-21 — Autônomo (prioridade negócio)

- [ ] `POST /api/plataforma/cadastros` — cria cadastro + 1º admin.
- [ ] UI `/web/cadastros` (lista) + **novo autônomo**.
- [ ] Teste: novo usuário loga e vê cadastro vazio no mobile.

### SPEC-20 — Usuários no cadastro

- [ ] API `/api/cadastro/membros`.
- [ ] UI `/web/usuarios` (criar inseminador / segundo admin).
- [ ] Login responsivo: conteúdo centralizado igual; desktop só expande `bg-login` + ondas full width (vaquinha fixa no canto) — ver SPEC-20.

## Futuro (não nesta sprint)

- Tipo **empresa**, holde/visão agregada, tela por funcionário.
- Permissões finas, planos, troca de e-mail, esqueci senha.

## Pronto quando

- Admin geral cria autônomo Vitor; Vitor usa `/entrar` no celular.
- Admin do cadastro adiciona outro login no mesmo tenant.
- Mobile sem regressão visual em `/entrar` e `/inicio`.