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

Login visual pronto. Auth ainda é mock (qualquer identificador e senha não vazios).
