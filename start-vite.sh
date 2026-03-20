#!/bin/bash
# =============================================================
# gig-rdo-vite - Kill & Start (porta 3001)
# =============================================================

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
FRONTEND_DIR="$SCRIPT_DIR/gig-rdo-vite"
PORT=3001
LOG="/tmp/gig-vite.log"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m'
BOLD='\033[1m'

LOCAL_IP=$(hostname -I | awk '{print $1}')

# Kill existing processes on port (including children)
PIDS=$(lsof -t -i:$PORT -sTCP:LISTEN 2>/dev/null || true)
if [ -n "$PIDS" ]; then
  echo -e "${YELLOW}Porta $PORT em uso. Matando processos...${NC}"
  for P in $PIDS; do
    pkill -P "$P" 2>/dev/null || true
    kill "$P" 2>/dev/null || true
  done
  sleep 1
fi

# Also kill any orphaned vite processes for this project
ORPHANS=$(pgrep -f "$FRONTEND_DIR/node_modules.*vite" 2>/dev/null || true)
if [ -n "$ORPHANS" ]; then
  echo -e "${YELLOW}Matando processos orfaos do Vite...${NC}"
  kill $ORPHANS 2>/dev/null || true
  sleep 1
fi

echo ""
echo -e "${BOLD}${CYAN}gig-rdo-vite${NC} - porta ${BOLD}$PORT${NC}"
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
echo -e "    Home:         ${CYAN}http://$LOCAL_IP:$PORT${NC}"
echo -e "    RDO:          ${CYAN}http://$LOCAL_IP:$PORT/rdo${NC}"
echo -e "    Analytics:    ${CYAN}http://$LOCAL_IP:$PORT/rdo/analytics${NC}"
echo -e "    Hora Extra:   ${CYAN}http://$LOCAL_IP:$PORT/rdo/analytics/hora-extra${NC}"
echo -e "    Colaborador:  ${CYAN}http://$LOCAL_IP:$PORT/rdo/colaborador${NC}"
echo -e "    Motivos:      ${CYAN}http://$LOCAL_IP:$PORT/rdo/motivos${NC}"
echo -e "    POC Charts:   ${CYAN}http://$LOCAL_IP:$PORT/poc-charts${NC}"
echo ""
echo -e "${YELLOW}Ctrl+C para parar${NC}"
echo ""

wait $VITE_PID
