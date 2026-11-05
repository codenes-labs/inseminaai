-- Testes manuais de isolamento entre cadastros (rodar no SQL Editor com service role ou supabase test).
-- Cenário: dois cadastros A e B, dois usuários; A não enxerga dados de B.

-- 1) Criar cadastros A e B
-- 2) Criar auth.users (via dashboard ou auth admin)
-- 3) Inserir membros_cadastro ligando cada user ao seu cadastro
-- 4) Autenticar como user A e tentar select em matrizes de B → zero linhas
-- 5) Autenticar como user sem membro → zero linhas em qualquer tabela

-- Exemplo de assert (substituir ids):
-- set request.jwt.claim.sub = '<user_a_uuid>';
-- select count(*) from matrizes where cadastro_id = '<cadastro_b_uuid>'; -- deve ser 0
