# SPEC-02 Cadastro de matrizes

**Objetivo:** cadastrar, editar, buscar e desativar matrizes.

## Critérios de aceite

- Nome é obrigatório; brinco é opcional, mas único dentro do cadastro
- Busca por nome ou brinco, sem diferenciar maiúsculas e acentos
- Matriz desativada some das listas de **seleção** (ex.: nova inseminação) e da lista principal; o filtro **Desativadas** e o histórico permanecem

## Testes unitários

- Validação de nome vazio
- Rejeita brinco duplicado no mesmo cadastro
- Aceita o mesmo brinco em cadastros diferentes
- Busca ignora acentos

## Estado atual

**Implementado:** CRUD via `/api/matrizes`, lista/detalhe/formulário mobile ligados ao Postgres; situação e histórico via SPEC-06. Conta **demo** não grava (403).
