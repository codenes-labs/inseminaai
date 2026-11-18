# SPEC-01 Autenticação e cadastro

**Objetivo:** o usuário entra com e-mail e senha e só enxerga os dados do seu cadastro.

## Critérios de aceite

- Login com e-mail e senha válidos leva ao início
- Credenciais inválidas mostram mensagem clara, sem revelar qual campo errou
- Rotas internas redirecionam para o login quando não há sessão
- Todo dado lido ou gravado carrega o `cadastro_id` do usuário logado

## Testes unitários

- Guarda de rota bloqueia sem sessão
- Serviço de sessão expõe o `cadastro_id`
- Mensagem de erro é genérica

## Estado atual

**Implementado (P2):** login em `/entrar` via `POST /api/auth/sign-in`, sessão JWT no `sessionStorage`, idle **2 h**, token **12 h**, guarda `RotaProtegida` nas rotas do app. Contas seed: admin e demo (SPEC-13). `cadastro_id` exposto na sessão do cliente; persistência no banco entra na P3.
