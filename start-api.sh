#!/bin/bash
# =============================================================
# API Micro Sankhya - Kill & Start (porta 3000)
# =============================================================

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
API_DIR="$SCRIPT_DIR/api-micro-sankhya"
PORT=3000
LOG="/tmp/gig-api.log"

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
echo -e "${BOLD}${CYAN}API Micro Sankhya${NC} - porta ${BOLD}$PORT${NC}"
echo ""

# Install deps
echo -e "${CYAN}Instalando dependencias...${NC}"
(cd "$API_DIR" && pnpm i)

# Start
echo -e "${CYAN}Iniciando API...${NC}"
cd "$API_DIR"
> "$LOG"
pnpm dev >> "$LOG" 2>&1 &
API_PID=$!

# Wait for ready
for i in $(seq 1 20); do
  if curl -s http://localhost:$PORT > /dev/null 2>&1; then
    break
  fi
  sleep 1
done

if ! kill -0 $API_PID 2>/dev/null; then
  echo -e "${RED}ERRO: API falhou. Ultimas linhas do log:${NC}"
  tail -20 "$LOG"
  exit 1
fi

echo ""
echo -e "${GREEN}API rodando!${NC}"
echo -e "  Local:  ${CYAN}http://localhost:$PORT${NC}"
echo -e "  Rede:   ${CYAN}http://$LOCAL_IP:$PORT${NC}"
echo -e "  Docs:   ${CYAN}http://$LOCAL_IP:$PORT/docs${NC}"
echo -e "  PID:    $API_PID"
echo -e "  Log:    $LOG"
echo ""
echo -e "${YELLOW}Ctrl+C para parar${NC}"
echo ""

# Cleanup on exit
cleanup() {
  kill $API_PID 2>/dev/null
  exit 0
}
trap cleanup SIGINT SIGTERM

# Stream logs in real time
tail -f "$LOG" &
TAIL_PID=$!

wait $API_PID
EXIT_CODE=$?
kill $TAIL_PID 2>/dev/null

if [ $EXIT_CODE -ne 0 ]; then
  echo ""
  echo -e "${RED}API encerrou com erro (exit code $EXIT_CODE)${NC}"
fi
