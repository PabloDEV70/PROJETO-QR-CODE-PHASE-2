#!/bin/bash

# ============================================
# API Micro Sankhya - Script de Inicialização
# ============================================

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funções de output
print_step() {
  echo -e "${BLUE}➜${NC} $1"
}

print_success() {
  echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
  echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
  echo -e "${RED}✗${NC} $1"
}

# Banner
echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║${NC}        API Micro Sankhya - Inicialização         ${BLUE}║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════╝${NC}"
echo ""

# Verificar dependências
print_step "Verificando dependências..."

if ! command -v pnpm &> /dev/null; then
  print_error "pnpm não encontrado! Instale com: npm install -g pnpm"
  exit 1
fi

if [ ! -d "node_modules" ]; then
  print_warning "node_modules não encontrado. Instalando..."
  pnpm install
fi

print_success "Dependências OK"

# Menu de opções
show_menu() {
  echo ""
  echo "Escolha uma opção:"
  echo ""
  echo "  1) 📦 Build do projeto"
  echo "  2) 🏃 Iniciar em modo desenvolvimento"
  echo "  3) 🚀 Iniciar produção"
  echo "  4) 🧪 Rodar testes"
  echo "  5) 🔍 Verificar código (lint)"
  echo "  6) 📄 Formatar código"
  echo "  7) 💚 Health check"
  echo "  8) 📊 Ver status"
  echo "  9) ❌ Sair"
  echo ""
}

# Função de health check
health_check() {
  print_step "Verificando health check..."
  curl -s http://localhost:80/health 2>/dev/null && {
    print_success "API está Online!"
  } || {
    print_error "API não está respondendo em localhost:80"
    print_warning "Certifique-se de que a API está rodando"
  }
}

# Função de status
show_status() {
  echo ""
  echo -e "${BLUE}📊 Status do Projeto${NC}"
  echo "─────────────────────────────────────"

  echo -e "${BLUE}Node:${NC}        $(node --version 2>/dev/null || echo 'não instalado')"
  echo -e "${BLUE}PNPM:${NC}        $(pnpm --version 2>/dev/null || echo 'não instalado')"
  echo -e "${BLUE}TypeScript:${NC}  $(pnpm tsc --version 2>/dev/null || echo 'erro')"

  if [ -f ".env" ]; then
    echo -e "${GREEN}✓${NC} Arquivo .env encontrado"
  else
    print_warning "Arquivo .env não encontrado"
  fi

  if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC} Dependências instaladas"
  else
    print_warning "Dependências não instaladas"
  fi

  echo ""
}

# Loop principal
main() {
  if [ "$1" ]; then
    # Modo direto (passando argumento)
    case "$1" in
      1|build)
        print_step " Fazendo build..."
        pnpm build
        print_success "Build concluído!"
        ;;
      2|dev)
        print_step "Iniciando modo desenvolvimento..."
        pnpm dev
        ;;
      3|start)
        print_step "Iniciando produção..."
        pnpm build && pnpm start
        ;;
      4|test)
        print_step "Rodando testes..."
        pnpm test:e2e
        ;;
      5|lint)
        print_step "Verificando código..."
        pnpm lint
        ;;
      6|format)
        print_step "Formatando código..."
        pnpm format
        ;;
      7|health)
        health_check
        ;;
      8|status)
        show_status
        ;;
      *)
        echo "Opção inválida: $1"
        exit 1
        ;;
    esac
    exit 0
  fi

  # Modo interativo
  while true; do
    show_menu
    read -p "Opção: " option

    case $option in
      1)
        print_step "Fazendo build..."
        pnpm build && print_success "Build concluído!" || print_error "Build falhou!"
        ;;
      2)
        print_step "Iniciando modo desenvolvimento..."
        pnpm dev
        ;;
      3)
        print_step "Iniciando produção..."
        pnpm build && pnpm start
        ;;
      4)
        print_step "Rodando testes..."
        pnpm test:e2e
        ;;
      5)
        print_step "Verificando código..."
        pnpm lint
        ;;
      6)
        print_step "Formatando código..."
        pnpm format
        ;;
      7)
        health_check
        ;;
      8)
        show_status
        ;;
      9)
        echo ""
        print_success "Até mais!"
        echo ""
        exit 0
        ;;
      *)
        print_error "Opção inválida!"
        ;;
    esac

    echo ""
    read -p "Pressione Enter para continuar..."
  done
}

main "$@"
