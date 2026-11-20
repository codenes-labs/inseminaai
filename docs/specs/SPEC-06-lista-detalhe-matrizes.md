# SPEC-06 Lista e detalhe das matrizes

**Objetivo:** ver a situação de cada matriz e o histórico completo.

## Critérios de aceite

- Etiqueta de situação: prenhe, pendente, vazia ou sem registro
- Filtros por situação e busca por nome ou brinco
- Detalhe mostra linha do tempo com inseminações, repetições e partos, da mais recente para a mais antiga

## Testes unitários

- Derivação da situação a partir da última inseminação
- Ordenação da linha do tempo
- Contagem de repetições igual a tentativas menos um

## Estado atual

**Implementado:** lista com situação e última IA via Postgres; filtros e busca; detalhe com linha do tempo (`GET /api/matrizes/:id/historico`), repetições e botões de diagnóstico/nova IA. Domínio em `resumo-reprodutivo.ts`.
