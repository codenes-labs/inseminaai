-- Testes manuais de isolamento entre cadastros (Postgres + role de app autenticada).
-- Cenário: dois cadastros A e B, dois usuários; A não enxerga dados de B.

-- 1) Criar cadastros A e B
-- 2) Criar users (tabela de auth do servidor — SPEC-14)
-- 3) Inserir membros_cadastro ligando cada user ao seu cadastro
-- 4) Autenticar como user A e tentar select em matrizes de B → zero linhas
-- 5) Autenticar como user sem membro → zero linhas em qualquer tabela