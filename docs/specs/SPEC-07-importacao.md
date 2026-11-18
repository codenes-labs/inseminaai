# SPEC-07 Importação da planilha (CSV)

**Objetivo:** trazer dados que hoje estão em planilha **sem digitar de novo**, via arquivo **`.csv` apenas** (sem `.xlsx` no MVP).

A planilha de referência tem duas abas lógicas (inseminações e repetições). Na importação CSV isso vira **dois arquivos** ou **um CSV** com colunas unificadas — layout fixo documentado no fixture em `docs/fixtures/`.

## Plano de migração

1. Criar as matrizes únicas a partir dos nomes
2. Criar reprodutor(es) e inseminador(es) citados no arquivo
3. Importar cada inseminação da primeira parte como tentativa 1
4. Importar repetições como tentativas 2, 3 e seguintes, marcando as anteriores como vazias
5. Datas no CSV em formato textual documentado (ex.: `dd/MM/yyyy` ou ISO); **não** há conversão de serial Excel

## Critérios de aceite

- Aceitar **somente `.csv`** (UTF-8; separador documentado no fixture)
- Matrizes, reprodutor e inseminador são criados sem duplicar
- Repetições viram tentativas 2, 3 e seguintes
- Importar o mesmo arquivo duas vezes não duplica registros

## Testes unitários

- Parse de datas do CSV
- Deduplicação de matrizes
- Mapeamento de repetições para tentativas
- Idempotência da importação

## Arquivo de referência (pergunta #11)

- **Formato:** somente **CSV** (decisão fechada)
- Fixture anonimizada em `docs/fixtures/` quando o arquivo real for confirmado para o repositório

## Estado atual

Não implementado. Falta o CSV de referência em `docs/fixtures/`.