---
name: testar-isolamento
description: Use sempre que uma tarefa criar ou alterar tabela, migration, política RLS ou consulta no Supabase. Garante que um cadastro nunca enxerga dados de outro.
---

# Testar isolamento entre cadastros

## Quando usar

Toda vez que mexer em tabela, migration, política RLS ou consulta ao banco.

## Checklist

1. A tabela nova tem a coluna `cadastro_id`, obrigatória, com chave estrangeira para cadastros?
2. A tabela tem RLS ligada, com políticas de leitura, inserção, atualização e exclusão?
3. As políticas descobrem o cadastro do usuário logado pela tabela `membros_cadastro`?
4. Existe teste com dois cadastros diferentes provando que A não lê, não altera e não apaga dados de B?
5. Existe teste provando que um usuário sem vínculo não lê nada?
6. Índices em `cadastro_id` foram criados para não ficar lento?

## Regras

- Nenhuma tabela de dados fica sem RLS, nem temporariamente.
- Nunca usar a chave de serviço do Supabase no front-end.
- Se algum item falhar, a tarefa não está pronta, mesmo que os outros testes passem.
