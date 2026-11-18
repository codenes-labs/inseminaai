# SPEC-05 Registrar diagnóstico

**Objetivo:** marcar a inseminação como prenhe ou vazia.

## Regras de negócio

- Prenhe: calcula a previsão de parto com a data da inseminação mais 283 dias
- Vazia: oferece criar nova inseminação, que será uma repetição
- A data do diagnóstico não pode ser anterior à da inseminação

## Testes unitários

- Previsão de parto correta, inclusive virada de mês e de ano
- Vazia não gera previsão
- Data de diagnóstico inválida é rejeitada
- Repetição incrementa a tentativa

## Estado atual

**Implementado:** `PATCH /api/inseminacoes/:id/diagnostico`, consulta da IA pendente por matriz, tela ligada ao Postgres; repetição abre nova inseminação com matriz pré-selecionada. Conta demo não grava.
