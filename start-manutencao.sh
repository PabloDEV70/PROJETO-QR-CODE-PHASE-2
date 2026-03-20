#!/bin/bash
# =============================================================
# app-manutencao-vite - Kill & Start (porta 3006)
# =============================================================

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
FRONTEND_DIR="$SCRIPT_DIR/app-manutencao-vite"
PORT=3006
LOG="/tmp/app-manutencao-vite.log"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m'
BOLD='\033[1m'
DIM='\033[2m'

LOCAL_IP=$(hostname -I | awk '{print $1}')

# Kill existing process on port
PID=$(lsof -t -i:$PORT -sTCP:LISTEN 2>/dev/null || true)
if [ -n "$PID" ]; then
  echo -e "${YELLOW}Porta $PORT em uso (PID $PID). Matando...${NC}"
  kill $PID 2>/dev/null || true
  sleep 1
fi

echo ""
echo -e "${BOLD}${CYAN}app-manutencao-vite${NC} - porta ${BOLD}$PORT${NC}"
echo -e "${DIM}proxy /api -> localhost:3000 (api-micro-sankhya)${NC}"
echo ""

# Check API is running
if curl -sf http://localhost:3000/health >/dev/null 2>&1; then
  echo -e "${GREEN}API backend respondendo em :3000${NC}"
else
  echo -e "${YELLOW}AVISO: API backend NAO responde em :3000${NC}"
  echo -e "${YELLOW}  Rode ./start-api.sh primeiro para funcionar corretamente${NC}"
fi
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
  tail -20 "$LOG"
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
echo -e "    Login:         ${CYAN}http://$LOCAL_IP:$PORT/login${NC}"
echo -e "    Dashboard:     ${CYAN}http://$LOCAL_IP:$PORT/${NC}"
echo -e "    OS:            ${CYAN}http://$LOCAL_IP:$PORT/os${NC}"
echo -e "    Apontamentos:  ${CYAN}http://$LOCAL_IP:$PORT/apontamentos${NC}"
echo -e "    Frota:         ${CYAN}http://$LOCAL_IP:$PORT/frota${NC}"
echo ""
echo -e "${YELLOW}Ctrl+C para parar${NC}"
echo ""

wait $VITE_PID
