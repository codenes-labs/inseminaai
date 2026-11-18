# SPEC-16 — CI/CD

**Objetivo:** pipelines de qualidade e deploy alinhados ao In House Bank.

## Critérios de aceite (a detalhar na implementação P4)

- `developer.yml` (branches): lint, testes, build
- `deploy.yml` (`master`): deploy Worker + secrets Neon
- Sem Dependabot por enquanto

## Estado atual

**Implementado:** só `deploy.yml` (PR: lint/coverage/build; `master`: deploy Cloudflare). Secrets Neon/Turnstile/Cloudflare no GitHub.