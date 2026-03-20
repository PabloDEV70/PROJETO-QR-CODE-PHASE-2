#!/bin/bash

# ============================================
# App Manutencao Vite - Script de Inicializacao
# ============================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
DIM='\033[2m'
NC='\033[0m'

print_step()    { echo -e "${BLUE}>>>${NC} $1"; }
print_success() { echo -e "${GREEN} ok${NC} $1"; }
print_warning() { echo -e "${YELLOW} !!${NC} $1"; }
print_error()   { echo -e "${RED}  x${NC} $1"; }

banner() {
  echo ""
  echo -e "${GREEN}${BOLD}  MANUTENCAO VITE${NC}  ${DIM}v$(node -p "require('./package.json').version" 2>/dev/null || echo '?')${NC}"
  echo -e "  ${DIM}port 3006 (dev) | proxy -> localhost:3000${NC}"
  echo ""
}

# -- Checks ------------------------------------------------------------------

check_deps() {
  local ok=true

  if ! command -v node &>/dev/null; then
    print_error "node nao encontrado"; ok=false
  fi

  if ! command -v pnpm &>/dev/null; then
    print_error "pnpm nao encontrado (npm i -g pnpm)"; ok=false
  fi

  $ok || exit 1

  if [ ! -d "node_modules" ]; then
    print_warning "node_modules ausente — instalando..."
    pnpm install --frozen-lockfile 2>/dev/null || pnpm install
  fi

  print_success "Dependencias OK"
}

check_api() {
  if curl -sf http://localhost:3000/health >/dev/null 2>&1; then
    print_success "API backend respondendo em :3000"
  else
    print_warning "API backend NAO responde em :3000 — inicie api-micro-sankhya primeiro"
  fi
}

# -- Commands -----------------------------------------------------------------

cmd_dev() {
  check_deps
  check_api
  echo ""
  print_step "Iniciando dev server em :3006 ..."
  pnpm dev
}

cmd_build() {
  check_deps
  print_step "Type-check + build ..."
  pnpm build
  local size
  size=$(du -sh dist 2>/dev/null | cut -f1)
  print_success "Build OK — dist/ ${size:-'(vazio)'}"
}

cmd_preview() {
  if [ ! -d "dist" ]; then
    print_warning "dist/ nao existe — rodando build primeiro..."
    cmd_build
  fi
  print_step "Preview em :7106 ..."
  pnpm preview
}

cmd_typecheck() {
  check_deps
  print_step "Type-check (tsc -b --noEmit) ..."
  pnpm exec tsc -b --noEmit
  print_success "Sem erros de tipo"
}

cmd_lint() {
  check_deps
  print_step "ESLint ..."
  pnpm lint
  print_success "Lint OK"
}

cmd_status() {
  echo ""
  echo -e "${BOLD}  Status${NC}"
  echo "  ──────────────────────────────────"
  echo -e "  Node:       ${CYAN}$(node -v 2>/dev/null || echo 'N/A')${NC}"
  echo -e "  pnpm:       ${CYAN}$(pnpm -v 2>/dev/null || echo 'N/A')${NC}"
  echo -e "  TypeScript: ${CYAN}$(pnpm exec tsc --version 2>/dev/null || echo 'N/A')${NC}"
  echo ""

  [ -d "node_modules" ] && print_success "node_modules presente" || print_warning "node_modules ausente"
  [ -d "dist" ]         && print_success "dist/ presente ($(du -sh dist | cut -f1))" || print_warning "dist/ ausente"

  echo ""
  check_api
  echo ""
}

cmd_clean() {
  print_step "Limpando dist/ e node_modules/.vite ..."
  rm -rf dist node_modules/.vite
  print_success "Limpo"
}

# -- Menu / Router ------------------------------------------------------------

show_help() {
  echo "  Uso: ./start.sh [comando]"
  echo ""
  echo "  Comandos:"
  echo "    dev        Inicia Vite dev server (:3006)"
  echo "    build      Type-check + build producao"
  echo "    preview    Serve dist/ local (:7106)"
  echo "    typecheck  Apenas verificacao de tipos"
  echo "    lint       ESLint"
  echo "    status     Mostra versoes e estado"
  echo "    clean      Remove dist/ e cache Vite"
  echo "    help       Mostra este menu"
  echo ""
  echo "  Sem argumento: inicia modo dev"
  echo ""
}

main() {
  banner

  local cmd="${1:-dev}"

  case "$cmd" in
    dev)        cmd_dev ;;
    build)      cmd_build ;;
    preview)    cmd_preview ;;
    typecheck)  cmd_typecheck ;;
    lint)       cmd_lint ;;
    status)     cmd_status ;;
    clean)      cmd_clean ;;
    help|-h|--help) show_help ;;
    *)
      print_error "Comando desconhecido: $cmd"
      show_help
      exit 1
      ;;
  esac
}

main "$@"
