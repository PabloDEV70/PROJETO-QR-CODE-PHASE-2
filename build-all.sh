#!/bin/bash
set -euo pipefail

# build-all.sh — Build sequencial de todas as apps
# Roda no server (ou local) depois de git pull + pnpm install

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

VITE_API="https://api-micro-sankhya.gigantao.net"

# Garante que .env.production existe para todas as SPAs
ensure_env_production() {
  local dir="$1"
  local extra="${2:-}"
  if [ ! -f "$dir/.env.production" ]; then
    echo "  Creating $dir/.env.production"
    echo "VITE_API_URL=$VITE_API" > "$dir/.env.production"
    [ -n "$extra" ] && echo "$extra" >> "$dir/.env.production"
  fi
}

echo "=== Ensuring .env.production files ==="
ensure_env_production app-chamados-vite
ensure_env_production app-etiquetas-vite "VITE_PUBLIC_URL=https://publico.gigantao.net"
ensure_env_production app-gestao-veiculos-pwa-vite
ensure_env_production app-manutencao-vite
ensure_env_production app-painel-veiculos-vite
ensure_env_production app-publico-vite
ensure_env_production app-pwa-rdomotivos
ensure_env_production app-tabman-pwa-vite
ensure_env_production app-gruposeservicos-vite
ensure_env_production app-quadro-vite
ensure_env_production app-ti-admin-vite
ensure_env_production app-compras-vite
ensure_env_production app-produtoselocais-vite
ensure_env_production app-rdoapontamentos-vite
ensure_env_production app-cabs-vite

echo ""
echo "=== Building api-micro-sankhya ==="
(cd api-micro-sankhya && pnpm build)

APPS=(
  app-publico-vite
  app-etiquetas-vite
  app-chamados-vite
  app-manutencao-vite
  app-pwa-rdomotivos
  app-painel-veiculos-vite
  app-gestao-veiculos-pwa-vite
  app-tabman-pwa-vite
  app-gruposeservicos-vite
  app-quadro-vite
  app-ti-admin-vite
  app-compras-vite
  app-produtoselocais-vite
  app-rdoapontamentos-vite
  app-cabs-vite
)

for app in "${APPS[@]}"; do
  echo ""
  echo "=== Building $app ==="
  (cd "$app" && pnpm build)
done

echo ""
echo "=== All builds complete ==="
