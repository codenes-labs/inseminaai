# Planejamento Inseminaí — contexto inicial (referência In House Bank)

**Objetivo deste documento:** servir como contexto para um novo chat de implementação. Consolida o que existe no repositório **Inseminaí**, o que a referência **In House Bank** oferece como plataforma reutilizável, o roteiro de specs/sprints e **perguntas em aberto** — sem inventar decisões **aguardando confirmação**.

**Última consolidação:** 2026-11-17 (perguntas #1–#15: rodada encerrada; **3** pendentes — §6.5).

---

## 0. Decisões registradas

| Data | Decisão | Registrado por |
| --- | --- | --- |
| 2026-11-17 | **Caminho B — plataforma In House Bank:** JWT, API `/api/*`, Postgres local no Docker, **Neon** em produção, Dev Container, Cloudflare **Worker** (API + SPA no mesmo host). **Não** usar Supabase Auth nem Cloudflare Pages como modelo-alvo. | aguardando confirmação |
| 2026-11-17 | **Neon em produção:** projeto Neon **novo**, dedicado ao Inseminaí (banco separado do In House Bank). | aguardando confirmação |
| 2026-11-17 | **Dev local:** Docker Compose **próprio** do Inseminaí (volume e porta separados). **Não** reutilizar Postgres do IHB nem outro database na mesma instância. O que vem do IHB é só **estrutura/padrão**, adaptada neste repositório — código e infra aqui são **exclusivos** do Inseminaí. | aguardando confirmação |
| 2026-11-17 | **Seed auth (dev):** mesmos e-mails e senhas do IHB — admin `admin@codenes.com.br` / `CodenesTemp1`; demo `teste@teste.com` / `teste` (ref. IHB `src/server/account-seed.ts`). | aguardando confirmação |
| 2026-11-17 | **Conta demo:** mutações **só em memória** (padrão IHB); **não** persiste no Postgres. | aguardando confirmação |
| 2026-11-17 | **Turnstile (go-live):** **não** obrigatório no deploy — captcha **off** até o secret existir; ativar depois. | aguardando confirmação |
| 2026-11-17 | **Multi-tenant (MVP):** manter **`cadastro_id` + `membros_cadastro`** — vários usuários por cadastro; **não** simplificar para 1 usuário = 1 cadastro. | aguardando confirmação |
| 2026-11-17 | **Papéis (MVP):** só **`administrador`** (acesso total) e **`inseminador`**. Papéis **`dono`**, **`gerente`**, **gerente de banco** — anotação futura, ainda sem definição. | aguardando confirmação |
| 2026-11-17 | **Node (oficial):** **22** (alinhado ao CI do IHB). | aguardando confirmação |
| 2026-11-17 | **Dependabot:** **não** configurar por enquanto. | aguardando confirmação |
| 2026-11-17 | **Cadastro público:** **off** em produção — sem rota pública de auto-cadastro; novos acessos só via **administrador geral**. | aguardando confirmação |
| 2026-11-17 | **Offline / PWA (MVP):** **obrigatório** no MVP — uso **sem internet** (SPEC-11). | aguardando confirmação |
| 2026-11-17 | **Marca (UI e docs):** **Insemina aí** (grafia com espaço). Identificadores técnicos permanecem **`inseminaai`** (npm, domínio); pasta local pode ser `inseminai`. | aguardando confirmação |
| 2026-11-17 | **Importação / exportação de dados:** **somente CSV** (SPEC-07 entrada, SPEC-10 saída); sem `.xlsx` no MVP. | aguardando confirmação |
| 2026-11-17 | **Público-alvo principal:** **inseminador autônomo** no curral/estrada (celular, uma mão). Produtor, fazenda e cooperativa continuam como **cadastro** possível; não é o foco do primeiro uso. | aguardando confirmação |

**Sprint 1 (2026-11-17):** Supabase removido; landing pública (`SPEC-19`); arquivos `SPEC-12` … `SPEC-18` criados; specs de produto SPEC-01 … 11 intactas.

**Próximo (antes de codar P1):** fechar plano Dev Container — `docs/plano-dev-container-p1.md` (§8) → implementar SPEC-12 (`docs/sprints/sprint-02-p1-plataforma-dev.md`).

**Ainda evolui nas sprints P1–P5:** Docker, auth, schema servidor, deploy Worker, termos/docs completos, SPEC-01 JWT.

---

## 1. Visão geral

### 1.1 Inseminaí (produto)

App web responsivo (PWA) para **registro de inseminações bovinas**: matrizes, inseminações, diagnósticos, repetições, lotes, dashboard e relatórios. Uso mobile-first, identidade verde já definida. Textos em português do Brasil.

**Não redesenhar** as telas existentes. **Não trocar** React/Vite por outro framework.

Fontes: `README.md`, `CLAUDE.md`, `docs/arquitetura.md`, `docs/banco.md`, `docs/principios.md` — **priorizar este planejamento e specs atualizadas** quando conflitarem com textos antigos de Supabase/Pages.

### 1.2 In House Bank (referência de plataforma)

Aplicação de controle financeiro pessoal; o valor para o Inseminaí está no **modelo de engenharia**, não no domínio bancário:

- SDD com `docs/specs`, sprints, `docs/estado-atual.md`, changelog duplo.
- Camadas (`domain` → `application` → `repositories` → UI).
- Postgres com RLS; servidor define contexto na transação (`current_setting` — no Inseminaí o filtro de negócio permanece **`cadastro_id`**).
- Auth própria: JWT HS256, sessão no cliente, API `/api/auth/*`, seed admin + demo, Turnstile, rate limit, TOTP opcional, idle 2 h, JWT 12 h.
- Dev: Dev Container + `.docker/` (Postgres 17 local + app Vite com handler `/api/*`).
- Prod: Cloudflare **Worker** (API + SPA no mesmo host), Neon como Postgres gerenciado.
- CI: `developer.yml` (branches) + `deploy.yml` (`master` → deploy).
- Site público: landing `/`, documentação `/docs/*`, termos, privacidade, OpenAPI.
- Governança: `AGENTS.md`, skills em `.cursor/skills/`.

### 1.3 Estado documentado vs plataforma-alvo

| Tema | Hoje no repo (código/docs antigos) | Alvo (decisão B) |
| --- | --- | --- |
| Auth | Mock + SPEC-01 citando Supabase | JWT + `/api/auth/*` (padrão IHB) |
| Banco | (Supabase removido) | `src/server/schema.ts` + migrations em `.docker/db/migrations/` |
| Isolamento | RLS por `cadastro_id` (conceito mantido) | RLS + contexto setado pelo servidor |
| Hospedagem | Pages (`VITE_SUPABASE_*`) | Worker + `wrangler deploy` |
| Dev local | só `npm run dev` | `.docker/` + Dev Container |
| CI | `ci.yml` simples | lint → coverage → build → deploy (estilo IHB) |

---

## 2. O que reaproveitar do In House Bank

Legenda: **✓ já alinhado** · **◐ parcial / legado** · **○ a implementar (alvo B)**

| Área | O que copiar (padrão IHB) | No Inseminaí hoje |
| --- | --- | --- |
| **SDD** | Spec antes do código; teste → implementar → refatorar | ✓ `docs/principios.md`, `docs/specs/`, `docs/sprints/` |
| **Camadas** | Domínio puro; infra atrás de repositórios | ◐ `src/features/*/{domain,...}`; páginas em `src/pages/` |
| **Postgres + RLS** | Servidor define contexto; políticas por linha | ◐ SQL Supabase legado; falta handler + `cadastro_id` no servidor |
| **JWT + API auth** | `/api/auth/sign-in`, `session`, idle, `must_change_password` | ○ |
| **Seed contas** | Admin real + demo | ○ |
| **Admin provisiona usuários** | Criação de contas pelo admin | ○ |
| **Turnstile + brute force** | SPEC-13 IHB | ○ |
| **Dev Container** | `.devcontainer/` + compose | ○ |
| **Docker dev** | `.docker/docker-compose.dev.yaml`, `Makefile` | ○ |
| **API no Vite** | `vite-api-handler`, `create-api-handler` | ○ |
| **Neon prod / pg local** | `pg-neon-compat` dev, Neon prod | ○ (substituir Supabase) |
| **Worker + SPA** | `worker/index.ts` | ◐ `wrangler.toml` mínimo; migrar de Pages |
| **CI** | `developer.yml` + `deploy.yml` | ◐ só `ci.yml` |
| **Docs públicas** | `/docs`, changelog, OpenAPI | ○ |
| **Changelog** | `docs/CHANGELOG.md` + `product-changelog.ts` | ○ |
| **Skills Cursor** | escrever/revisar/implementar spec, sprint, isolamento | ○ |
| **LICENSE / README operacional** | Primeiro dia, health, env | ◐ README mínimo |

### 2.1 O que **não** trazer do IHB

- Domínio financeiro (parcelamentos, caixinhas, carnê, Pix, holding, PDFs bancários, etc.).
- RLS só por `user_id` **no lugar** de `cadastro_id` sem spec — multi-tenant do Inseminaí é por **cadastro**.
- Copy, paleta e landing do In House Bank.

### 2.2 Mapeamento mental IHB → Inseminaí

| Conceito IHB | Equivalente conceitual Inseminaí |
| --- | --- |
| `BankRepository` | Repositórios por feature (`matrizes`, `inseminacoes`, …) |
| `user_id` em tabelas de dados | **`cadastro_id`** em tabelas de dados |
| `users` + seed | `users` (auth) + `cadastros` + `membros_cadastro` |
| Admin seed | `admin@codenes.com.br` / `CodenesTemp1` (igual IHB) |
| Conta demo | `teste@teste.com` / `teste`; dados **só em memória** (igual IHB) |
| `menu_access` / papéis | MVP: **`administrador`** (tudo) + **`inseminador`**; futuro: `dono`, `gerente`, gerente de banco (sem spec ainda) |

---

## 3. Específico do Inseminaí

### 3.1 Modelo de dados (negócio — mantido)

Referência de entidades: `docs/banco.md`, `.docker/db/migrations/20251104200000_initial_schema.sql` (a **traduzir** para schema servidor + RLS no modelo B).

`cadastros`, `membros_cadastro`, `matrizes`, `reprodutores`, `inseminadores`, `lotes`, `inseminacoes`.

Regras de domínio: repetição (`numero_tentativa`), datas de diagnóstico e parto — testes em `src/features/inseminacoes/domain/calculos.test.ts`.

### 3.2 Telas e rotas (design pronto — sujeito a ajuste de auth)

Hoje o login está em `/`. No padrão IHB, login costuma ser `/entrar` com landing em `/` — **não decidido** se o Inseminaí separa landing e login (pergunta futura apenas se necessário; não bloqueia Neon).

| Rota (atual) | Função |
| --- | --- |
| `/` | Landing pública |
| `/entrar`, `/termos`, `/privacidade`, `/docs` | Stubs (sprint 1) |
| `/inicio` | Dashboard (telas prontas, sem rota) |
| `/matrizes`, … | Matrizes, diagnóstico |
| `/nova-inseminacao` | Nova inseminação |
| `/relatorios`, `/mais` | Relatórios, configurações |

Dados: mock (`src/data/mock.ts`).

### 3.3 Stack alvo vs atual

- **Alvo (B):** React/Vite/TS/Tailwind/Vitest + API Worker + Neon + JWT (espelho IHB).
- **Atual:** site público + telas mock em `src/pages/` (sem rota até P2).
- **Node:** **22** (decisão 2026-11-17; alinhar `CLAUDE.md` / toolchain ao implementar P4).

### 3.4 Sprint 0 — replanejado sob caminho B

Itens já feitos (front, migrations SQL legado, testes domain, CI básico) **permanecem válidos**.

Itens **cancelados** como critério de “pronto” (caminho A):

- ~~Supabase remoto linkado~~
- ~~Deploy Cloudflare Pages~~

Itens **substitutos** (entram em P1–P4):

- [ ] `.docker/` + Dev Container + `DATABASE_URL` local (compose **exclusivo** — decisão 2026-11-17)
- [ ] Neon de produção configurado (projeto **novo** — decisão 2026-11-17)
- [ ] Worker deploy + domínio `inseminaai.codenes.com.br` (quando secrets existirem)
- [x] Remover Supabase do repositório (sprint 1)
- [x] Landing pública (sprint 1)

---

## 4. Specs principais

### 4.1 Produto (SPEC-01 … SPEC-11) — existentes, SPEC-01 desatualizada

| Spec | Título | Observação pós-decisão B |
| --- | --- | --- |
| SPEC-01 | Autenticação e cadastro | Reescrever para JWT + `cadastro_id` (não Supabase) antes de implementar |
| SPEC-02 … 11 | (domínio) | Válidas; persistência via API/repositório, não cliente Supabase |

### 4.2 Plataforma e site público

| Spec | Tema | Arquivo |
| --- | --- | --- |
| SPEC-19 | Landing pública | `docs/specs/SPEC-19-landing-publica.md` (**concluída** 2026-11-20) |
| SPEC-12 | Docker, health | `docs/specs/SPEC-12-plataforma-docker.md` |
| SPEC-13 | Auth JWT | `docs/specs/SPEC-13-auth-jwt.md` |
| SPEC-14 | Schema + RLS | `docs/specs/SPEC-14-schema-rls.md` |
| SPEC-15 | Worker | `docs/specs/SPEC-15-worker-deploy.md` |
| SPEC-16 | CI/CD | `docs/specs/SPEC-16-ci-cd.md` |
| SPEC-17 | Docs/termos | `docs/specs/SPEC-17-docs-publicas.md` (**concluída** 2026-11-20) |
| SPEC-18 | Governança | `docs/specs/SPEC-18-governanca.md` |
| SPEC-20 | Painel web + usuários no cadastro | `docs/specs/SPEC-20-painel-web-usuarios.md` (fase 2) |
| SPEC-21 | Cadastro de empresas (autônomo primeiro) | `docs/specs/SPEC-21-cadastro-empresas.md` (fase 2, web IHB) |

Critérios detalhados de implementação entram ao abrir cada sprint P1–P5.

---

## 5. Sprints

### 5.1 Sprints (ordem atual)

| Sprint | Foco | Arquivo / specs |
| --- | --- | --- |
| **1 — fechada** | Landing, fim Supabase, esboço plataforma | `sprint-01-landing-site-publico.md`, SPEC-19, 12–18 |
| **P1–P5** | Plataforma IHB | `sprint-02` … `sprint-06-p5-*.md`, SPEC-12–18 |
| **Produto 1** | Login e cadastros | `sprint-07-produto-login-cadastros.md`, SPEC-01–03 |

### 5.1.1 Sprints de produto (2–6) — após P2/P3

| Sprint | Foco | Specs |
| --- | --- | --- |
| **2** | Núcleo MVP | 04, 05, 06 |
| **3** | Importação planilha | 07 |
| **4** | Dashboard e lote | 08, 09 |
| **5** | Exportação e offline | 10, 11 |
| **6** | Polimento, LGPD, planos | itens do checklist sprint 6 |

**Bloqueio:** produto 1 só começa após P2 (auth) e trecho de P3 necessário para CRUD persistido.

**Entrega produto:** seguir **`docs/roteiro-produto.md`** (SPEC-01 … 11, **mobile primeiro**; web/desktop depois).

Índice completo: `docs/sprints/README.md`.

Dependência sprint 3 (produto): planilha *Registros de Inseminações - Vitor Bezerra* — **pergunta 11 pendente de revisão** (local/formato ainda não confirmados).

---

## 6. Perguntas em aberto (aguardando confirmação)

Responder **uma por vez**. Itens **resolvidos** estão na seção 6.1.

### 6.1 Resolvidas

| # | Pergunta | Resposta |
| --- | --- | --- |
| — | Caminho A (Supabase + Pages) vs caminho B (plataforma IHB)? | **B** — JWT, API, Docker, Neon, Worker (2026-11-17). |
| — | Perguntas 6.2 (bloco Supabase): projeto remoto, `VITE_*`, deploy Pages, etc. | **N/A** — caminho A descartado. |
| — | Hospedagem Worker vs Pages (antiga #11)? | **Worker** (mesmo host API + SPA), por derivação da decisão B e referência IHB. |
| **1** | Produção Neon: mesmo projeto do IHB ou projeto **novo**? | **Projeto Neon novo** — banco dedicado ao Inseminaí (2026-11-17). |
| **2** | Dev local: Postgres compartilhado com IHB ou compose **separado**? | **Opção A — compose próprio** do Inseminaí: volume e porta próprios; não reutilizar instância Postgres do IHB. Tudo neste repo é exclusivo do Inseminaí; do IHB aproveita-se apenas a **estrutura**, reutilizada de forma específica aqui (2026-11-17). |
| **3** | E-mails e senhas iniciais do seed **admin** e **demo**? | **Igual ao In House Bank** (2026-11-17): admin `admin@codenes.com.br` + `CodenesTemp1`; demo `teste@teste.com` + `teste`. |
| **4** | Conta **demo**: memória vs Postgres? | **Igual ao IHB** — demo **só em memória**; não grava no Postgres (2026-11-17). |
| **5** | Turnstile obrigatório no go-live? | **Não** — deploy permitido com Turnstile **desligado** (sem secret); ligar captcha quando o secret estiver configurado (2026-11-17). |
| **6** | Multi-tenant no MVP? | Manter **`cadastro_id` + `membros_cadastro`** com **vários usuários por cadastro**; sem atalho 1 usuário = 1 cadastro (2026-11-17). |
| **7** | Papéis no MVP? | Só **`administrador`** (acesso a tudo) e **`inseminador`**. `dono`, `gerente`, gerente de banco — **futuro**, ainda não definidos (2026-11-17). |
| **8** | Versão **Node** oficial? | **22** (2026-11-17). |
| **9** | **Dependabot**? | **Sem Dependabot** por enquanto; não configurar (2026-11-17). |
| **10** | Cadastro público (`/cadastro`)? | **Off** em produção; sem auto-cadastro. Quem concede acesso é o **administrador geral** (2026-11-17). |
| **14** | SPEC-11 offline/PWA no MVP? | **Obrigatório no MVP** — deve funcionar **sem internet** (2026-11-17). |
| **15** | Marca na UI e docs? | **Insemina aí** (2026-11-17; corrigido em relação ao rascunho “InseminaAI”). |
| **11** | Planilha SPEC-07 — formato? | **Somente CSV** (import e export); sem xlsx no MVP (2026-11-17). |

### 6.1.1 Registrado — decisão adiada (continua pendente)

| # | Pergunta | Registro (aguardando confirmação) |
| --- | --- | --- |
| **12** | Cadastro automático no primeiro login? | **Pendente** — não sabe o que é o fluxo; **deixa para depois** (2026-11-17). |
| **13** | Limites Free/Pro e UX ao exceder? | **Pendente por enquanto** — sem valores nem UX definidos (2026-11-17). |

### 6.2 Infra e auth (caminho B — pendentes)

*Nenhuma — bloco 6.2 encerrado em 2026-11-17.*

### 6.3 Produto e dados (pendentes)

| # | Pergunta | Status |
| --- | --- | --- |
| **11** | Planilha SPEC-07: está no repositório ou só local? Formato? | **Resolvido:** somente **CSV**; fixture anonimizada em `docs/fixtures/` **quando** o arquivo for liberado para o repo (caminho/nome do arquivo real ainda a conferir) |
| **12** | “Cadastro automático no primeiro login” (sprint 6): MVP ou só comercialização? | **Pendente** — ver §6.1.1 (adiado) |
| **13** | Limites Free/Pro (ex.: máximo de matrizes): valores e UX ao exceder? | **Pendente** — ver §6.1.1 |

### 6.4 Próxima pergunta (uma por vez)

*Rodada **#1–#15** encerrada em 2026-11-17. Retomar quando houver resposta para algum item de §6.3.*

### 6.5 Resumo da seção 6 (2026-11-17)

| Métrica | Valor |
| --- | --- |
| Perguntas numeradas **#1–#15** | **13 respondidas** (#11 formato CSV), **2 pendentes** (#12, #13) |
| Bloco infra **6.2** (#1–#9) | Encerrado (todas respondidas) |
| Itens sem número em **6.1** (caminho A/B, Supabase, Worker) | Resolvidos |

**Pendentes (sem decisão final):**

| # | Tema |
| --- | --- |
| **11** | ~~Planilha~~ — formato CSV fechado; falta só **arquivo** no `docs/fixtures/` |
| **12** | Cadastro automático no primeiro login |
| **13** | Limites Free/Pro e UX ao exceder |

---

## 7. Estado do repositório para o agente

- **Workspace Inseminaí:** repositório atual (ex.: `/app` no Dev Container)
- **Referência:** repositório **In House Bank** clonado localmente (fora deste workspace)
- **Plataforma-alvo:** decisão **B** (seção 0)
- **Governança:** `AGENTS.md`, `docs/principios.md`; não inventar; não commit/push sem pedido; não alterar design verde sem pedido.

### 7.1 Próximos passos

1. ~~Perguntas de infra §6 (#1–#15)~~ — resolvidas (3 pendentes: 11–13).
2. **Plano Dev Container** — `docs/plano-dev-container-p1.md`; §8 aguardando confirmação.
3. ~~SPEC-12 (P1)~~ — implementado; validar Dev Container no dia a dia.
4. **P2 (SPEC-13)** → **SPEC-01** real; **P3 (SPEC-14)** → persistência para **SPEC-02+**.
5. Roteiro contínuo: `docs/roteiro-produto.md` (01 … 11).

---

## 8. Referências rápidas

| Inseminaí | Caminho |
| --- | --- |
| Este planejamento | `docs/planejamento-contexto-inicial.md` |
| Plano Dev Container (P1) | `docs/plano-dev-container-p1.md` |
| Specs produto | `docs/specs/SPEC-01` … `SPEC-11` |
| Sprints | `docs/sprints/` |
| SQL de referência (pré-SPEC-14) | `.docker/db/migrations/` |

| In House Bank | Caminho |
| --- | --- |
| Banco / schema | `docs/banco.md`, `src/server/schema.ts` |
| Auth | `docs/specs/SPEC-04`, `SPEC-13`–`15` |
| Docker / dev | `docs/specs/SPEC-09`, `.docker/` |
| CI/CD | `.github/workflows/developer.yml`, `deploy.yml` |

---

*Este planejamento não substitui as specs numeradas: em caso de conflito, prevalece a SPEC atualizada após decisão B.*