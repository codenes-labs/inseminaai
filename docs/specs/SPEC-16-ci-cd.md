# SPEC-16 — CI/CD

**Objetivo:** pipelines de qualidade e deploy alinhados ao In House Bank.

## Critérios de aceite (a detalhar na implementação P4)

- `developer.yml` (branches): lint, testes, build
- `deploy.yml` (`master`): deploy Worker + secrets Neon
- Sem Dependabot por enquanto

## Estado atual

**Implementado:** `deploy.yml` em `master` (lint, coverage, build, Wrangler). `ci.yml` em PRs. Secrets Neon/Turnstile/Cloudflare no GitHub.