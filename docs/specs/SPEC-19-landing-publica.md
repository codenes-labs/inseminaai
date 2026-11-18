# SPEC-19 — Landing pública

**Objetivo:** visitante entende o que é o **Insemina aí** e acessa login ou links institucionais.

## Critérios de aceite

- `/` explica o produto em português do Brasil, identidade verde existente
- Cabeçalho: alternar tema claro/escuro (ícones Sun/Moon do lucide) e link **Entrar** → `/entrar`
- Rodapé: **Termos de uso**, **Privacidade**, **Documentação** (mesma estrutura do In House Bank)
- Padrão visual: layout tipo IHB (chrome público, botões `min-h-12`, `press`, `Cartao`) — **sem** alterar ícones do produto (`CowIcon`, etc.)
- Demais telas do app **não** roteadas nesta sprint

## Testes unitários

- `theme-mode`: parse e classe `theme-dark`

## Melhorias pendentes (backlog)

- Hero e cards com algo **animado ou interativo** (motion leve, hover, ilustração) — **sem** redesenhar identidade verde nem trocar copy sem revisão (aguardando confirmação).
- Depende da revisão de texto da sprint 1; não bloqueia P2 (auth).

## Estado atual

Implementado na sprint 1 (2026-11-17). Critérios de aceite atendidos; melhorias visuais acima ficam em aberto.