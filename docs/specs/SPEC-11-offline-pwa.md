# SPEC-11 Modo offline e PWA

**Objetivo:** continuar registrando sem internet e sincronizar depois.

## Critérios de aceite

- PWA instalável na tela inicial, ícone verde
- Registros feitos offline entram numa fila local
- Ao reconectar, são enviados em ordem
- Conflito nunca apaga dado

## Testes unitários

- Enfileiramento
- Reenvio em ordem
- Falha parcial mantém o item na fila

## Estado atual

Há `manifest.webmanifest`. Sem service worker nem fila offline.
