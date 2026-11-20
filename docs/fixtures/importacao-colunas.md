# CSV de importação (SPEC-07)

- **Encoding:** UTF-8 (com ou sem BOM)
- **Separador:** `;` (ponto e vírgula)
- **Extensão:** `.csv` apenas

## Colunas (cabeçalho obrigatório na 1ª linha)

| Coluna | Obrigatório | Exemplo |
| --- | --- | --- |
| `matriz` | sim | Madame |
| `brinco` | não | 0142 |
| `reprodutor` | sim | Netuno FIV |
| `inseminador` | sim | Vitor Almeida |
| `data` | sim | `02/10/2026` ou `2026-10-02` |
| `tipo` | sim | `IATF`, `CN` ou `Protocolo` |
| `lote` | não | Lote 1 – Maternidade |

## Repetições

Várias linhas da **mesma matriz** são ordenadas por **data** e viram tentativa 1, 2, 3…  
Ao importar tentativa ≥ 2, a tentativa anterior da mesma matriz passa a **vazia** (se ainda estiver pendente).

## Idempotência

Cada linha gera a chave `matriz|data|tentativa` (normalizada). Reimportar o mesmo arquivo **não duplica**.

Fixture de exemplo: `importacao-exemplo.csv` (mesmo conteúdo do **Baixar modelo** na tela Importar).