#!/bin/bash
set -euo pipefail

# deploy.sh — Deploy unificado para producao
# Estrategia: git pull no server + build no server + pm2 restart
# User: gigantinho | Host: 192.168.1.9:2222

PROD_HOST="192.168.1.9"
PROD_PORT="2222"
PROD_USER="gigantinho"
PROD_PATH="/home/gigantinho/proj-micro-sankhya"

SSH_CMD="ssh -p $PROD_PORT $PROD_USER@$PROD_HOST"

echo "==========================================="
echo "  Deploy Unificado — proj-micro-sankhya"
echo "==========================================="
echo ""

# Step 1: Git pull
echo "[1/4] Git pull no servidor..."
$SSH_CMD "cd $PROD_PATH && git pull"
echo ""

# Step 2: Install deps
echo "[2/4] pnpm install..."
$SSH_CMD "cd $PROD_PATH && pnpm install --frozen-lockfile"
echo ""

# Step 3: Build all apps
echo "[3/4] Build de todas as apps..."
$SSH_CMD "cd $PROD_PATH && bash build-all.sh"
echo ""

# Step 4: Restart PM2
echo "[4/4] Reiniciando PM2..."
$SSH_CMD "cd $PROD_PATH && pm2 delete all 2>/dev/null || true && pm2 start ecosystem.config.cjs && pm2 save"
echo ""

echo "==========================================="
echo "  Deploy completo!"
echo "==========================================="
echo ""
echo "Verificar: $SSH_CMD \"pm2 list\""
