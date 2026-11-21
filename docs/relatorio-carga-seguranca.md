# Relatório: teste de carga e auditoria de segurança

**Projeto:** Insemina aí  
**Data:** 2026-03-20  
**Ambiente do teste de carga:** API local (`http://127.0.0.1:5173`, Vite dev + PostgreSQL com `database_ok: true`)  
**Ferramenta:** [autocannon](https://github.com/mcollina/autocannon) 7.15.0 (`npx`)

---

## 1. Teste de carga

### Metodologia

- **Perfil padrão:** 50 conexões HTTP concorrentes, duração **30 segundos** por endpoint.
- **Autenticação:** JWT obtido via `POST /api/auth/sign-in` com `admin@codenes.com.br` (credencial seed de dev).
- **Observação:** login da conta demo (`teste@teste.com`) falhou neste banco local (senha divergente do seed em arquivo); o **dashboard** foi exercitado com o JWT do admin.
- **Criação de cadastros (POST):** 20 conexões, 30 s, corpo JSON com **e-mail único por requisição** (script autocannon em `/tmp`).
- **p95:** autocannon reporta percentil **97,5%**; usado como aproximação de p95.

### Resultados

| Endpoint | Método | Requisições | RPS médio | Taxa de erro | Timeouts | p50 (ms) | p95≈p97.5 (ms) | p99 (ms) |
|----------|--------|-------------|-----------|--------------|----------|----------|----------------|----------|
| `/api/auth/sign-in` | POST | 809 | 27,0 | 0% | 0 | 1832 | 2048 | 2053 |
| `/api/plataforma/cadastros` | GET | 13 691 | 456,4 | 0% | 0 | 95 | 233 | 279 |
| `/api/plataforma/cadastros/{id}` (cadastro demo) | GET | 17 465 | 582,2 | 0% | 0 | 74 | 195 | 234 |
| `/api/plataforma/cadastros/{id}` (cadastro demo) | PATCH | 9 082 | 302,7 | 0% | 0 | 150 | 305 | 366 |
| `/api/dashboard` | GET | 15 665 | 522,2 | 0% | 0 | 88 | 157 | 196 |
| `/api/plataforma/cadastros` (e-mails únicos) | POST | 762 | 25,4 | 0% | 0 | 761 | 1163 | 1277 |

### Teste inválido (referência)

`POST /api/plataforma/cadastros` com **50 conexões** e **mesmo e-mail** no corpo: ~753 requisições, **~99,9% erros** (conflito de e-mail / validação esperada). Não representa capacidade de criação.

### Conclusões de carga

1. **Gargalo:** login e provisionamento de cadastro (~25–27 req/s, p50 ~0,8–1,8 s) — custo de **hash de senha** e transações no Postgres.
2. **Leituras e PATCH:** centenas de req/s, latência sub-200 ms no p50, **zero erros e zero timeouts** no período medido.
3. O teste POST com e-mails únicos **inseriu cadastros de carga** no banco de desenvolvimento.

---

## 2. Auditoria de segurança (análise estática do código)

Escopo: código no repositório; sem exploração de sistemas externos.

### Resumo por severidade

| Severidade | Quantidade | Temas principais |
|------------|------------|------------------|
| Crítico | 0 | RLS + JWT nas rotas de tenant (com testes de isolamento existentes) |
| Alto | 3 | Mock demo só no cliente; PII agregada na listagem plataforma; senha do role DB na migration |
| Médio | 4 | Gate plataforma só por e-mail; fallback JWT sem linha no banco; login sem rate limit sem Turnstile; credenciais seed documentadas |
| Baixo | 3 | `/api/health` público; JWT em `sessionStorage`; sem CORS permissivo explícito |

### Achados detalhados

#### Alto — Mock do demo apenas no navegador

- **Onde:** `src/lib/api-client.ts` intercepta chamadas quando `sessao.demo`; `src/server/routes/demo-guard.ts` bloqueia **writes** no servidor, mas **reads** seguem para o Postgres.
- **Risco:** usuário ou integração que chame a API diretamente (sem o front) com JWT demo vê dados **reais** do cadastro demo no banco; a UI sugere sandbox isolado.
- **Correção sugerida:** interceptar no Worker para `usuario.demo` (leitura/escrita em snapshot) ou política read-only + dataset fixo no servidor.

#### Alto — Listagem plataforma concentra PII

- **Onde:** `listarCadastrosPlataforma` expõe `emailLogin` e `emailsBusca` de todos os clientes (SPEC-23).
- **Risco:** vazamento ampliado se o gate da plataforma falhar ou credencial for comprometida.
- **Correção:** reforçar MFA/auditoria; mascarar e-mails na grade quando possível; checar `plataforma_admin` no banco além do e-mail.

#### Alto — Senha fixa do role `inseminaai_app` na migration

- **Onde:** `.docker/db/migrations/*inseminaai_app*`.
- **Risco:** segredo versionado; perigoso se a role for alcançável fora do ambiente de dev.
- **Correção:** provisionar senha fora do SQL versionado; variável de ambiente no deploy.

#### Médio — API com JWT demo serve dados reais

- Corolário do item “mock só no navegador”; escritas retornam 403, leituras não usam `demo-mock-resposta.ts` no servidor.

#### Médio — Login sem rate limit sem Turnstile

- **Onde:** `src/server/auth/handle-auth.ts` — Turnstile só se `TURNSTILE_SECRET_KEY` estiver definida.
- **Correção:** obrigar Turnstile em produção; rate limit por IP/e-mail.

#### Médio — Senhas de seed documentadas

- **Onde:** `src/server/auth/account-seed.ts`, `README.md`.
- **Correção:** aceitável em dev; produção com senhas exclusivas e rotação pós-deploy.

#### Médio — Gate da plataforma por e-mail único

- **Onde:** `emailEhAdminPlataformaCodenes` em `src/server/routes/plataforma.ts`.
- **Correção:** combinar allowlist com flag `plataforma_admin` no banco.

#### Médio — Fallback de autenticação via claims JWT

- **Onde:** `usuarioDoPayload` em `src/server/auth/resolve-user.ts` se o usuário não existir mais no banco.
- **Correção:** invalidar token quando não houver usuário ativo no banco.

#### Baixo — `GET /api/health` sem autenticação

- Expõe `database_ok`, `configured`, `jwt`.
- **Correção:** restringir em produção ou reduzir campos.

#### Baixo — Token em `sessionStorage`

- Risco clássico de XSS.
- **Correção:** CSP rigorosa; evitar `dangerouslySetInnerHTML`.

### Pontos positivos

- `handle-data.ts` exige Bearer JWT em rotas de dados (exceto `health` e `auth`).
- Plataforma retorna **403** para quem não é `admin@codenes.com.br`.
- `GET/PATCH /api/cadastro/membros` exige papel **administrador** do cadastro.
- Respostas de login não incluem `password_hash`.
- `.env` e `.docker/.env` estão no `.gitignore`.
- Testes de isolamento RLS (`rls-isolation.integration.spec.ts`).

---

## 3. Cobertura no CI (commit `2a1d4c2`)

O job **Coverage** falhou após `feat(plataforma): proteger cadastros seed e mock local da conta demo` porque:

- `vitest.config.ts` exige **80% em branches** (e demais métricas) só em `src/features/**/domain/**`.
- Entraram **`demo-mock-estado.ts`** (muitos branches não exercitados) e funções novas em **`cadastros-sistema.ts`** (`mensagemBloqueio*`) sem testes.

**Correção:** testes em `demo-mock-estado.test.ts` e casos de mensagens em `cadastros-sistema.test.ts`. Após isso, na execução local: **statements 89,4%**, **branches 81,1%**, **functions 97,0%**, **lines 92,5%**.

---

## 4. Performance do CI

**Arquivo:** `.github/workflows/deploy.yml`

### Gargalos identificados

| Fator | Impacto estimado |
|-------|------------------|
| **Cadeia sequencial** lint → test → build → deploy | Cada job faz `npm ci` (~1–3 min); wall-clock somava etapas. |
| **Deploy na `master`** | `npm run db:setup` no Neon + `wrangler deploy` + sync de secrets (maior parte dos ~28 min vs ~1 min do In House Bank, que não migra Neon nem publica Worker a cada push). |
| **Sync duplicado de secrets** após o deploy | Chamada extra ao Wrangler (~1–3 min). |
| **4× `npm ci`** por pipeline (lint, test, build, cloudflare) | Redundante, mas `cache: npm` no `setup-node` já mitiga em parte. |

### Otimizações aplicadas

1. **Lint e Coverage em paralelo** — `build` depende de `needs: [lint, test]` (ganho de wall-clock ~2–4 min em PRs).
2. **Removido o segundo “Sync Worker secrets again”** após o deploy (~1–3 min na `master`).
3. **Deploy na `master`:** `npm run db:migrate` idempotente no job Cloudflare (sem seed); depois secrets + `wrangler deploy`.

### Ganhos estimados

- **Pull request (sem deploy):** ~3–5 min mais rápido.
- **Push na `master` sem migration:** ~5–15 min a menos (sem round-trip Neon + seed).
- **Push com migration nova:** tempo semelhante ao antigo só na etapa `db-migrate`.

### Referência In House Bank

O repositório IHB **não está montado neste ambiente** (procurei pastas irmãs e URLs públicas `codenes/*`). Pela documentação interna (`docs/planejamento-contexto-inicial.md`):

- **`developer.yml`** em branches + **`deploy.yml`** na `master`.
- Mesmo modelo **Worker + Neon**; schema já provisionado; migrations **fora** do caminho crítico de cada deploy de app.
- CI “rápido” (~1 min) típico em commits **só de app** (lint/test/build/deploy Worker), sem migrar banco nem re-seedar produção.

---

## 5. Referências

- Commit de proteção seed + mock demo: `2a1d4c2`
- Config de cobertura: `vitest.config.ts` (threshold global 80% em `src/features/**/domain/**`)