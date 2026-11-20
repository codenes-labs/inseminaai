# SPEC-20 — Painel web e gestão de usuários

**Objetivo:** oferecer interface **web (desktop)** para administrar o cadastro e **convidar/criar usuários** que acessam o mesmo `cadastro_id`, no padrão do In House Bank. **Fora de escopo nesta spec:** matriz fina de permissões por papel (fica para spec futura).

## Contexto

- O MVP mobile já atende o inseminador em campo.
- Proprietários e administradores precisam, em tela larga, gerenciar membros e dados sem redesenhar o app mobile (`docs/principios.md` — mobile primeiro; web é **camada adicional**).

## Critérios de aceite (rascunho)

- Rota web protegida (ex.: `/admin` ou `/conta/usuarios`) acessível apenas a usuário com papel **administrador** do cadastro (definir enum atual em `membros_cadastro`).
- Listar membros do cadastro atual (nome/e-mail, papel, ativo).
- **Criar usuário:** e-mail, nome, senha inicial ou convite (definir na implementação); vínculo em `membros_cadastro`.
- **Desativar** membro (sem apagar histórico de operações).
- Troca de e-mail **sem perda de dados** do cadastro (mesmo `user_id` ou migração documentada).
- Layout desktop: reutilizar identidade verde; não alterar telas mobile existentes.
- Toda consulta e gravação respeita `cadastro_id` e RLS.

## Referência

- In House Bank: fluxo de contas e membros (não copiar UI).
- SPEC-01, SPEC-13, SPEC-14.

## Não inclui (fase posterior)

- Permissões granulares (só inseminador X vê matriz Y).
- Planos Free/Pro e limites comerciais (sprint 6 / polimento).
- Trust and safety (rate limit, Turnstile global) — specs de plataforma à parte.

## Estado atual

**Planejado** — aguarda validação E2E do MVP mobile e fechamento de SPEC-17/18.