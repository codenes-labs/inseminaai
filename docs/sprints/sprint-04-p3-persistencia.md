# Sprint P3 — Persistência

**Specs:** SPEC-14

## Checklist

- [x] `src/server/schema.ts` + migrações aplicáveis (`npm run db:setup`)
- [x] RLS `cadastro_id` + contexto na transação (`comCadastroId`)
- [x] Repositórios HTTP por feature (padrão: `matrizes-repository` + `GET /api/matrizes`)
- [x] Teste de isolamento (`DATABASE_URL` no Vitest)