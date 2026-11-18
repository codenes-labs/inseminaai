# Plano — Dev Container e stack local (pré-SPEC-12)

**Objetivo:** fechar o desenho do ambiente de desenvolvimento **antes** de implementar a SPEC-12, copiando a **estrutura** do In House Bank sem compartilhar instância Postgres nem `.env` com o IHB.

**Decisões já fixas** (`docs/planejamento-contexto-inicial.md` §6): compose **exclusivo** do Insemina aí; Node **22**; Neon **projeto novo** em produção (compose só para dev); pasta/npm/domínio `inseminaai`.

**Referência:** repositório **In House Bank** (clone local) — `.docker/`, `.devcontainer/`, `docs/specs/SPEC-09-projeto-b.md`.

---

## 1. O que o Dev Container deve entregar

| Entrega | Descrição |
| --- | --- |
| **Abrir no container** | Dev Containers aponta para `.docker/docker-compose.dev.yaml`, serviço `app`, workspace `/app`. |
| **Postgres dedicado** | Serviço `db` no mesmo compose, volume **próprio**, healthcheck `pg_isready`. |
| **App Node** | Imagem dev com `node:22-bookworm-slim`, usuário `node`, `npm ci` na imagem ou no `postCreate`. |
| **Vite acessível** | `npm run dev -- --host 0.0.0.0`; portas publicadas via `.docker/.env`. |
| **Variáveis** | `.docker/.env` (gitignored) a partir de `.docker/.env.example`; `DATABASE_URL` aponta para host `db` **dentro** da rede compose. |
| **Primeiro dia** | README: copiar `.env.example` → `.docker/.env`, `make docker-dev` ou “Reopen in Container”. |

Fora do escopo deste plano (sprints seguintes): Worker, Neon real, auth JWT, schema aplicado no banco (SPEC-13/14).

---

## 2. Portas e nomes (evitar colisão com IHB no mesmo host)

IHB usa por padrão Postgres **5432** e Vite **5173**. Com os dois repos no WSL, o Insemina aí deve usar **outras portas externas** se os dois stacks puderem rodar juntos.

| Variável | Proposta Insemina aí | IHB (referência) |
| --- | --- | --- |
| `POSTGRES_EXTERNAL` | **5434** | 5432 |
| `POSTGRES_INTERNAL` | 5432 | 5432 |
| `PORT_EXTERNAL` | **5173** | 5173 |
| `PORT_INTERNAL` | **5173** | 5173 |
| `POSTGRES_USER` / `POSTGRES_DB` | `inseminaai` | `inhouse` |
| Volume compose | `inseminaai_postgres_data` | `postgres_data` |

`DATABASE_URL` dentro do compose:  
`postgresql://inseminaai:inseminaai@db:5432/inseminaai`

No host (fora do container, com só o `db` no ar):  
`postgresql://inseminaai:inseminaai@localhost:5434/inseminaai`  
(host com só o serviço `db`: credenciais em `.docker/.env.example`.)

---

## 3. Árvore de arquivos a criar (implementação SPEC-12)

```
.docker/
  .env.example          # portas, POSTGRES_*, DATABASE_URL, JWT_SECRET dev
  Dockerfile.dev        # Node 22, git, make; sem k6 no MVP do plano (opcional depois)
  docker-compose.dev.yaml
.devcontainer/
  devcontainer.json     # composeFile, service app, forwardPorts [5173, 5434]
  start-dev-server.sh   # espelho IHB (Vite na PORT_INTERNAL)
  # ensure-git-https-remote.sh — opcional, mesmo padrão do IHB (aguardando confirmação)
Makefile                # alvos mínimos: help, docker-dev, docker-dev-down, dev, test, lint
.gitignore              # .docker/.env
```

**Não trazer no P1:** Prometheus/Grafana (comentados no IHB; manter desligado).

---

## 4. `devcontainer.json` (rascunho de comportamento)

- **name:** `Insemina aí` (marca visível no VS Code/Cursor).
- **dockerComposeFile:** `${localWorkspaceFolder}/.docker/docker-compose.dev.yaml`
- **service:** `app`
- **workspaceFolder:** `/app`
- **remoteUser:** `node`
- **postCreateCommand:** `npm ci` (e scripts auxiliares se necessário).
- **postStartCommand / postAttachCommand:** `start-dev-server.sh` (Vite em background).
- **forwardPorts:** `5173`, `5434`.
- **extensions (mínimo):** Tailwind, Docker; Peacock com cor verde **`#14532D`** (identidade existente — **não** trocar ícones do produto).

---

## 5. Ordem de trabalho sugerida (sprint P1)

1. **Planejamento** — este documento; revisão aguardando confirmação (portas, Makefile, extensões).
2. **SPEC-12** — critérios de aceite fechados a partir da §6–8 abaixo.
3. **Implementar compose + Dev Container** — sem API ainda, se necessário em dois PRs internos.
4. **Esqueleto `GET /api/health`** — handler Vite (como IHB); teste de integração mínimo; health **não** precisa conectar ao banco na v1 (espelhar IHB: flags `configured` / `database` / `jwt`).
5. **README** — “primeiro dia” + `make help`.
6. **Fechar SPEC-12** — marcar sprint P1 checklist.

SPEC-13 (auth) e migrações aplicadas no Postgres entram **depois** do container estável.

---

## 6. Critérios de aceite propostos (para colar na SPEC-12)

1. Com `.docker/.env` preenchido a partir do example, `docker compose -f .docker/docker-compose.dev.yaml up` sobe `db` + `app` sem usar rede/volume do IHB.
2. “Reopen in Container” instala deps e o Vite responde em `http://localhost:5173` (ou `PORT_EXTERNAL` no `.env`).
3. `pg_isready` passa no serviço `db`; dados persistem no volume `inseminaai_postgres_data`.
4. Documentação: raiz do repo descreve compose exclusivo e diferença host vs rede Docker (`db` vs `localhost`).
5. `GET /api/health` retorna 200 com JSON documentado (implementação + teste de integração leve).
6. CI atual (`npm test`, `lint`, `build`) continua passando **sem** exigir Docker no GitHub Actions (por enquanto).

---

## 7. Dependências das próximas specs

| Spec | Depende do Dev Container? |
| --- | --- |
| **SPEC-13** Auth | Sim — `JWT_SECRET` e eventual seed no mesmo `.env`. |
| **SPEC-14** Schema | Sim — aplicar SQL/migrations no `db` local. |
| **SPEC-15** Worker | Não para subir compose; sim para parity de `DATABASE_URL` em prod. |
| **SPEC-17** Docs | Pode documentar “primeiro dia” após P1 fechado. |

---

## 8. Decisões (2026-11-17)

| # | Tema | Decisão |
| --- | --- | --- |
| 1 | Portas | **5173** (Vite) e **5434** (Postgres no host) |
| 2 | Scripts git HTTPS | **Omitir** no Dev Container |
| 3 | k6 | **Adiar** |
| 4 | Extensões | **Mínima** (Tailwind + Docker; Peacock verde) |

---

## 9. Estado

Implementado em 2026-11-17 (SPEC-12 / sprint P1).