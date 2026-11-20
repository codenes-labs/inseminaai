# SPEC-10 Exportação e relatórios

**Objetivo:** baixar os dados em **CSV** e ver taxas de prenhez.

## Critérios de aceite

- Relatório e CSV respeitam **período**: padrão mês civil atual; **um campo** com faixa `DD/MM/YYYY – DD/MM/YYYY`, calendário com seleção entre duas datas, **Limpar** (mês atual) e **Hoje** (dia 1 até hoje)
- Exportar inseminações em **arquivo `.csv`** (UTF-8, separador conforme locale BR ou `;` documentado), com as **mesmas colunas** da planilha de referência, **filtrado pelo período**
- Download pelo app (mobile): compartilhar/salvar o CSV no dispositivo
- Comprovante em **imagem** (estilo resumo para WhatsApp) e **PDF completo** (taxas, situação, listas por reprodutor/tipo/lote); marca e site **uma vez** no rodapé; **prévia** do PDF antes de gerar; um botão **Exportar** abre escolha (CSV, imagem, prévia/PDF)
- Taxa de prenhez por reprodutor, tipo e lote
- Número médio de repetições

## Testes unitários

- Formatação das colunas
- Cálculo da taxa com divisão por zero tratada

## Estado atual

**Implementado (2026-11-20):** `GET /api/relatorios/resumo`, `GET /api/relatorios/inseminacoes.csv` (colunas alinhadas ao import), taxas por reprodutor/tipo/lote e média de repetições na aba Relatórios.
