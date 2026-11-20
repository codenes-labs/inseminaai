# Estado atual do projeto

**Atualizado:** 2026-11-20

## Produto (app logado — mobile)

| Área | Estado |
| --- | --- |
| Auth JWT, rotas protegidas | Em uso |
| Matrizes, cadastros auxiliares | API + telas |
| Nova inseminação, diagnóstico, lote | API + telas |
| Dashboard (SPEC-08) | Implementado |
| Relatórios CSV/PDF, período, comprovante | Implementado (SPEC-10) |
| Offline — fila e sincronização | Implementado (SPEC-11) |
| Mais → Configurações (tema, senha, importar CSV) | Implementado |

## Site público

| Rota | Estado |
| --- | --- |
| `/` | Landing interativa (SPEC-19 **concluída**) |
| `/entrar` | Login |
| `/termos`, `/privacidade`, `/docs` | Conteúdo publicado (SPEC-17) |

## Plataforma

- **Worker** + SPA em `inseminaai.codenes.com.br`
- **Postgres** Neon + migrations em `.docker/db/migrations/`
- **CI/CD:** `.github/workflows/deploy.yml` (SPEC-15/16)
- **Sem Supabase** no caminho crítico

## Pendente (deliberado)

- Sprint 6 — polimento (planos, revisão LGPD operacional, INPI)
- Git / releases formais
- Turnstile em todos os ambientes (se exigido em prod)
- **SPEC-20** — painel web e criação de usuários (fase 2)
- Testes E2E (mockados ou Playwright) — validação antes da fase web

## Próximo foco sugerido

1. Validação ponta a ponta do fluxo principal (login → matriz → IA → diagnóstico → relatório).
2. SPEC-20: cadastro de usuários no mesmo `cadastro_id` (sem matriz de permissões ainda).