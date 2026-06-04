#!/usr/bin/env bash
# QNBS-v3: Monorepo-Root unabhängig vom Tauri-CWD (CI vs. lokal src-tauri).
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
export CULINASYNC_DESKTOP_BUILD="${CULINASYNC_DESKTOP_BUILD:-1}"
exec pnpm run build
