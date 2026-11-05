# Supabase

## Migration local

1. Instale o [Supabase CLI](https://supabase.com/docs/guides/cli).
2. `supabase link --project-ref SEU_REF`
3. `supabase db push` (aplica `supabase/migrations/`)

## Schema

Tabelas: `cadastros`, `membros_cadastro`, `matrizes`, `reprodutores`, `inseminadores`, `lotes`, `inseminacoes`.

RLS filtra por `cadastro_id` via `membros_cadastro` e `auth.uid()`.

## Teste de isolamento

Roteiro em `supabase/tests/rls_isolamento.sql`. Rodar com dois usuários de teste antes de ir para produção.

## Front-end

Variáveis em `.env.local` a partir de `.env.example`. Integração com Supabase entra no Sprint 1 (SPEC-01).
