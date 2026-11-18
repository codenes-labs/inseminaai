#!/usr/bin/env bash
# Container dev não inclui openssh-client; origin SSH quebra commit/push no Cursor.
# Converte git@github.com:org/repo → https://github.com/org/repo.git (padrão IHB).
set -euo pipefail

root="$(git rev-parse --show-toplevel 2>/dev/null || true)"
if [ -z "$root" ]; then
  exit 0
fi
cd "$root"

url="$(git config --get remote.origin.url 2>/dev/null || true)"
if [ -z "$url" ]; then
  exit 0
fi

https=""
if [[ "$url" =~ ^git@github\.com:(.+)$ ]]; then
  https="https://github.com/${BASH_REMATCH[1]}"
elif [[ "$url" =~ ^ssh://git@github\.com/(.+)$ ]]; then
  https="https://github.com/${BASH_REMATCH[1]}"
fi

if [ -z "$https" ]; then
  exit 0
fi

case "$https" in
  *.git) ;;
  *) https="${https}.git" ;;
esac

if [ "$url" = "$https" ]; then
  exit 0
fi

git remote set-url origin "$https"
echo "[devcontainer] origin ajustado para HTTPS (sem ssh no container):" >&2
echo "  $https" >&2