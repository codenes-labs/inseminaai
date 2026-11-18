# Roteiro produto — SPEC-01 … SPEC-11

Ordem de implementação do **app logado** (após plataforma mínima). Cada entrega valida **mobile primeiro** (`docs/principios.md`); layout desktop só depois.

**UI:** manter telas já desenhadas; trocar mock por API/persistência sem redesenhar.

## Pré-requisitos de plataforma (não são SPEC de produto)

| Bloqueio | Spec / sprint | Necessário para |
| --- | --- | --- |
| Auth JWT + `/api/auth/*` | SPEC-13, P2 | SPEC-01 em diante |
| Schema, RLS, repositórios | SPEC-14, P3 | SPEC-02 … 06 (dados reais) |

P1 (SPEC-12) e **P3 (SPEC-14)** concluídas na prática; próximo **SPEC-02** (matrizes com API).

## Fila (uma spec por vez)

| # | Spec | Estado hoje | Próximo passo |
| --- | --- | --- | --- |
| 1 | **SPEC-01** Autenticação | JWT, sessão, rotas protegidas | Revisão mobile; vínculo Postgres na P3 |
| 2 | **SPEC-02** Matrizes | CRUD + API | Histórico real; situacao via inseminações (SPEC-06) |
| 3 | **SPEC-03** Cadastros auxiliares | CRUD + filtros ativos | — |
| 4 | **SPEC-04** Registrar inseminação | Persistência + API | Diagnóstico (SPEC-05); listas reais (SPEC-06) |
| 5 | **SPEC-05** Diagnóstico | Tela visual | Gravar diagnóstico, previsão, repetição |
| 6 | **SPEC-06** Lista/detalhe matrizes | Mock | Dados reais, timeline |
| 7 | **SPEC-07** Importação CSV | Não feito | Idempotência; fixture em `docs/fixtures/` quando liberar arquivo |
| 8 | **SPEC-08** Dashboard | Números mock | Métricas do cadastro |
| 9 | **SPEC-09** Lançamento em lote | Sem tela | Fluxo lote (mobile) |
| 10 | **SPEC-10** Exportação/relatórios | Resumo parcial | **Export CSV** + taxas |
| 11 | **SPEC-11** Offline PWA | Só manifest | Fila offline obrigatória no MVP |

## Sprints de arquivo (mapeamento)

| Arquivo sprint | Specs |
| --- | --- |
| `sprint-07-produto-login-cadastros.md` | 01, 02, 03 |
| `sprint-02-nucleo-mvp.md` | 04, 05, 06 |
| `sprint-03-migracao.md` | 07 |
| `sprint-04-dashboard-lote.md` | 08, 09 |
| `sprint-05-exportacao-offline.md` | 10, 11 |

## Definition of Done (cada SPEC)

- Critérios da spec atendidos em **viewport mobile**
- Testes da spec verdes; `cadastro_id` / RLS quando houver dado
- `Estado atual` atualizado em `docs/specs/SPEC-NN-*.md`

Decisões de negócio e copy pendentes: **aguardando confirmação** (`docs/planejamento-contexto-inicial.md` §6).