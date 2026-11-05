# SPEC-07 Importação da planilha

**Objetivo:** trazer os dados atuais do Excel sem digitar de novo.

A planilha tem duas abas lógicas: inseminações e repetições.

## Plano de migração

1. Criar as matrizes únicas a partir dos nomes (Madame, Fumaça, Amazona, Bordada, Boneca, Jurema, Grauna, Chatinha, Cabrinha, Cafe, Espada, Saia Branca, Mimosa)
2. Criar o reprodutor Anthonny e o inseminador Vitor Bezerra
3. Importar cada inseminação da primeira tabela como tentativa 1
4. Importar as datas da tabela de repetições como tentativas 2, 3 e seguintes, marcando as anteriores como vazias
5. As datas do Excel vêm como números seriais e precisam ser convertidas para datas reais

## Critérios de aceite

- Datas em número serial do Excel viram datas reais
- Matrizes, reprodutor e inseminador são criados sem duplicar
- Repetições da segunda tabela viram tentativas 2, 3 e seguintes
- Importar o mesmo arquivo duas vezes não duplica registros

## Testes unitários

- Conversão de serial para data
- Deduplicação de matrizes
- Mapeamento de repetições para tentativas
- Idempotência da importação

## Estado atual

Não implementado. Falta o arquivo da planilha no repositório.
