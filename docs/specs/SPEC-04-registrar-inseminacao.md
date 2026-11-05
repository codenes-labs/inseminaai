# SPEC-04 Registrar inseminação

**Objetivo:** registrar uma inseminação em poucos toques.

## Regras de negócio

- A tentativa é 1 para a primeira inseminação da matriz e aumenta quando a anterior ficou vazia
- A data prevista do diagnóstico é a data da inseminação mais 30 dias, ajustável nas configurações
- Se a matriz já tem inseminação pendente, o sistema avisa antes de salvar
- Data não pode ser futura

## Critérios de aceite

- Data inicia em hoje, e o último inseminador usado vem preenchido
- Tipo escolhido por botões: CN, IATF ou Protocolo
- Ao salvar, o status inicial é pendente

## Testes unitários

- Cálculo de tentativa (primeira, repetição após vazia)
- Cálculo da data prevista
- Bloqueio de data futura
- Aviso de pendência
- Status inicial pendente

## Estado atual

Formulário visual pronto. Salvar só navega de volta, sem gravar.
