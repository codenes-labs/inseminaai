# Banco

Todas as tabelas de dados carregam **cadastro_id**. Cada cadastro é um cliente (em geral **inseminador autônomo** no MVP; também produtor, cooperativa ou empresa). Toda consulta e toda regra de segurança filtra por `cadastro_id`, descobrindo o cadastro do usuário logado pela tabela `membros_cadastro`.

## cadastros

| Campo | Tipo | Observação |
| --- | --- | --- |
| id | uuid | chave primária |
| nome | text | ex.: Vitor Bezerra, Cooperativa Boa Terra |
| plano | text | gratuito, básico, pro (para uso futuro) |
| ativa | boolean | padrão true |
| created_at | timestamptz | automático |

## membros_cadastro

Liga cada usuário do login ao seu cadastro.

| Campo | Tipo | Observação |
| --- | --- | --- |
| id | uuid | chave primária |
| cadastro_id | uuid | referência a cadastros |
| user_id | uuid | referência a `users` (auth do servidor — SPEC-14) |
| papel | text | MVP: administrador ou inseminador (legado SQL cita dono/gerente) |

## matrizes

| Campo | Tipo | Observação |
| --- | --- | --- |
| id | uuid | chave primária |
| cadastro_id | uuid | referência a cadastros (obrigatório) |
| nome | text | ex.: Madame, Fumaça |
| brinco | text | número do brinco (opcional, único no cadastro) |
| raca | text | opcional |
| data_nascimento | date | opcional |
| ativa | boolean | padrão true |
| observacoes | text | opcional |
| created_at | timestamptz | automático |

## reprodutores

| Campo | Tipo | Observação |
| --- | --- | --- |
| id | uuid | chave primária |
| cadastro_id | uuid | referência a cadastros (obrigatório) |
| nome | text | ex.: Anthonny |
| raca | text | opcional |
| codigo_semen | text | código ou lote da palheta (opcional) |
| ativo | boolean | padrão true |

## inseminadores

| Campo | Tipo | Observação |
| --- | --- | --- |
| id | uuid | chave primária |
| cadastro_id | uuid | referência a cadastros (obrigatório) |
| nome | text | ex.: Vitor Bezerra |
| ativo | boolean | padrão true |

## lotes

Agrupa as vacas que entram juntas num mesmo protocolo.

| Campo | Tipo | Observação |
| --- | --- | --- |
| id | uuid | chave primária |
| cadastro_id | uuid | referência a cadastros (obrigatório) |
| nome | text | ex.: Protocolo 27/09 |
| data_inicio | date | início do protocolo |
| observacoes | text | opcional |

## inseminacoes

Cada inseminação (inclusive repetição) é uma linha.

| Campo | Tipo | Observação |
| --- | --- | --- |
| id | uuid | chave primária |
| cadastro_id | uuid | referência a cadastros (obrigatório) |
| matriz_id | uuid | referência a matrizes |
| reprodutor_id | uuid | referência a reprodutores |
| inseminador_id | uuid | referência a inseminadores |
| lote_id | uuid | referência a lotes (opcional) |
| data | date | data da inseminação |
| tipo | text | CN, IATF ou PROTOCOLO |
| numero_tentativa | int | 1 = primeira, 2 = primeira repetição, etc. |
| status | text | pendente, prenhe, vazia |
| data_diagnostico_prevista | date | data + N dias (30 padrão; média por matriz após diagnósticos) |
| data_diagnostico | date | quando o diagnóstico foi feito |
| previsao_parto | date | data + 283 dias, só se prenhe |
| data_parto | date | preenchida quando ocorrer |
| observacoes | text | opcional |
| created_at | timestamptz | automático |

**Regra de repetição:** quando o status vira "vazia" e a matriz é inseminada de novo, a nova linha recebe `numero_tentativa + 1`. O total de repetições de uma matriz é tentativas menos um.

## Segurança

- RLS em todas as tabelas, filtrando por `cadastro_id`
- Contexto `cadastro_id` setado apenas no servidor na transação
- Mudanças de schema em `.docker/db/migrations/` e, após SPEC-14, no pipeline do servidor
