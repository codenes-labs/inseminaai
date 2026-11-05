# SPEC-03 Cadastros auxiliares

**Objetivo:** gerenciar reprodutores, inseminadores e lotes.

## Critérios de aceite

- Adicionar e editar com formulário de poucos campos
- Itens inativos não aparecem na seleção da nova inseminação

## Testes unitários

- Validação de nome obrigatório
- Filtro de ativos
- Criação associa o `cadastro_id`

## Estado atual

Nova inseminação já lista reprodutores, inseminadores e lotes mock. Menu Mais mostra os nomes. Não há CRUD.
