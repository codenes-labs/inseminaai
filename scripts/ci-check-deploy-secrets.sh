#!/usr/bin/env bash
set -euo pipefail
test -n "${DATABASE_URL:-}" || { echo "::error::Defina o secret DATABASE_URL"; exit 1; }
test "${#JWT_SECRET:-}" -ge 32 || { echo "::error::JWT_SECRET precisa de ao menos 32 caracteres"; exit 1; }
test -n "${TURNSTILE_SECRET_KEY:-}" || { echo "::error::Defina TURNSTILE_SECRET_KEY"; exit 1; }
test -n "${TURNSTILE_SITE_KEY:-}" || { echo "::error::Defina TURNSTILE_SITE_KEY"; exit 1; }