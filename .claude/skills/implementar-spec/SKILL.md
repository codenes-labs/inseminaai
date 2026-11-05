---
name: implementar-spec
description: Use quando o usuário disser para implementar a SPEC-NN. Testes primeiro, código mínimo, refatoração.
---

# Implementar spec

1. Ler a spec em `docs/specs` e `docs/principios.md`.
2. Escrever os testes unitários que cobrem os critérios (vermelho).
3. Implementar o mínimo para passar (verde).
4. Refatorar com os testes protegendo.
5. Se mexer em tabela, migration, RLS ou consulta, seguir `testar-isolamento`.
6. Não alterar o design visual sem pedido.
7. Não commitar nem fazer push sem pedido.
