# SPEC-09 Lançamento em lote

**Objetivo:** registrar um protocolo inteiro de uma vez.

## Critérios de aceite

- Escolher data, tipo e reprodutor uma única vez e marcar várias matrizes
- Gerar uma inseminação por matriz
- Se uma falhar, nenhuma é gravada

## Testes unitários

- Geração de N registros
- Atomicidade
- Aviso para matrizes com pendência

## Estado atual

**Implementado (2026-11-20):** `POST /api/inseminacoes/lote` (transação única), preview de pendências, tela `/inseminacao-lote`, domínio `lancamento-lote.ts`.
