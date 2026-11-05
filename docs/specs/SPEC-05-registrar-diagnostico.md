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

Tela visual pronta. Salvar ainda não persiste.
