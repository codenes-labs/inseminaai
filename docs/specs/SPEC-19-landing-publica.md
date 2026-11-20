# SPEC-19 — Landing pública

**Objetivo:** visitante entende o que é o **Insemina aí** e acessa login ou links institucionais.

## Critérios de aceite

- `/` explica o produto em português do Brasil, identidade verde existente; copy com foco em **inseminador autônomo** (mobile, curral/estrada)
- Cabeçalho: alternar tema claro/escuro (ícones Sun/Moon do lucide) e link **Entrar** → `/entrar`
- Rodapé: **Termos de uso**, **Privacidade**, **Documentação** (mesma estrutura do In House Bank)
- Padrão visual: layout tipo IHB (chrome público, botões `min-h-12`, `press`, `Cartao`) — **sem** alterar ícones do produto (`CowIcon`, etc.)
- Demais telas do app **não** roteadas nesta sprint

## Testes unitários

- `theme-mode`: parse e classe `theme-dark`

## Estado atual

**Concluída (2026-11-20).** Landing em React na rota `/`: hero, demonstração em 3 etapas no celular (Voltar/Próximo), cards de passos, bloco “Para quem é”, **Entrar** → `/entrar`, tema via `ThemeProvider`, rodapé com links para termos, privacidade e documentação.