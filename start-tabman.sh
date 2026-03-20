#!/bin/bash
# =============================================================
# app-tabman-pwa-vite - Kill & Start (porta 3010)
# PWA tablet multi-usuario para apontamento RDO
# =============================================================

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
FRONTEND_DIR="$SCRIPT_DIR/app-tabman-pwa-vite"
PORT=3010
LOG="/tmp/app-tabman-pwa-vite.log"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m'
BOLD='\033[1m'

LOCAL_IP=$(hostname -I | awk '{print $1}')

# Kill existing process on port
PID=$(lsof -t -i:$PORT -sTCP:LISTEN 2>/dev/null || true)
if [ -n "$PID" ]; then
  echo -e "${YELLOW}Porta $PORT em uso (PID $PID). Matando...${NC}"
  kill $PID 2>/dev/null || true
  sleep 1
fi

echo ""
echo -e "${BOLD}${CYAN}app-tabman-pwa-vite${NC} - porta ${BOLD}$PORT${NC}"
echo -e "  PWA tablet multi-usuario (apontamento RDO)"
echo ""

# Install deps
echo -e "${CYAN}Instalando dependencias...${NC}"
(cd "$FRONTEND_DIR" && pnpm i)

# Start
echo -e "${CYAN}Iniciando Vite...${NC}"
cd "$FRONTEND_DIR"
pnpm dev > "$LOG" 2>&1 &
VITE_PID=$!

# Wait for ready
for i in $(seq 1 15); do
  if curl -s http://localhost:$PORT > /dev/null 2>&1; then
    break
  fi
  sleep 1
done

if ! kill -0 $VITE_PID 2>/dev/null; then
  echo -e "${RED}ERRO: Vite falhou. Veja $LOG${NC}"
  exit 1
fi

echo ""
echo -e "${GREEN}Vite rodando!${NC}"
echo -e "  Local:  ${CYAN}http://localhost:$PORT${NC}"
echo -e "  Rede:   ${CYAN}http://$LOCAL_IP:$PORT${NC}"
echo -e "  PID:    $VITE_PID"
echo -e "  Log:    $LOG"
echo ""
echo -e "  ${BOLD}Paginas${NC}"
echo -e "    Setup:       ${CYAN}http://$LOCAL_IP:$PORT/setup${NC}"
echo -e "    Grid:        ${CYAN}http://$LOCAL_IP:$PORT/${NC}"
echo ""
echo -e "  ${BOLD}PWA Tablet${NC}"
echo -e "    1. Abra no tablet pelo navegador"
echo -e "    2. Toque em 'Adicionar a tela inicial'"
echo -e "    3. Configure o supervisor no primeiro acesso"
echo -e "    4. Colaboradores se identificam pelo grid de fotos"
echo ""
echo -e "${YELLOW}Ctrl+C para parar${NC}"
echo ""

wait $VITE_PID
