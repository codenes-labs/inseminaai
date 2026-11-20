# SPEC-08 Dashboard

**Objetivo:** resumo do mês e alertas.

## Critérios de aceite

- Cartões de inseminadas no mês, pendentes, prenhes e vazias
- Lista de diagnósticos que vencem em 7 dias
- Próximos partos

## Testes unitários

- Contagens por período
- Janela de 7 dias
- Ordenação dos partos previstos

## Estado atual

**Implementado (2026-11-20):** `GET /api/dashboard`, domínio `dashboard.ts`, tela Início com dados reais (cartões, alerta 7 dias, partos e últimas IA).

**Implementado (2026-11-20):** lista `diagnosticosProximos7Dias` na API; **Ver** no alerta abre Matrizes filtrada por esses IDs (ordem da data prevista), sem lista duplicada no Início.
