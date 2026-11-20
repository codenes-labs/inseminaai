# SPEC-10 Exportação e relatórios

**Objetivo:** baixar os dados em **CSV** e ver taxas de prenhez.

## Critérios de aceite

- Exportar inseminações em **arquivo `.csv`** (UTF-8, separador conforme locale BR ou `;` documentado), com as **mesmas colunas** da planilha de referência
- Download pelo app (mobile): compartilhar/salvar o CSV no dispositivo
- Taxa de prenhez por reprodutor, tipo e lote
- Número médio de repetições

## Testes unitários

- Formatação das colunas
- Cálculo da taxa com divisão por zero tratada

## Estado atual

**Implementado (2026-11-20):** `GET /api/relatorios/resumo`, `GET /api/relatorios/inseminacoes.csv` (colunas alinhadas ao import), taxas por reprodutor/tipo/lote e média de repetições na aba Relatórios.
