#!/bin/bash
# =============================================================
# app-rdoapontamentos-vite - Kill & Start (porta 3005)
# =============================================================

# Configurações
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
FRONTEND_DIR="$SCRIPT_DIR/app-rdoapontamentos-vite"
PORT=3005
LOG="/tmp/app-rdoapontamentos-vite.log"

# Cores e Formatação
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m'
BOLD='\033[1m'
DIM='\033[2m'

LOCAL_IP=$(hostname -I | awk '{print $1}')

# Função de limpeza ao sair
cleanup() {
  echo -e "\n${YELLOW}Parando processos...${NC}"
  [ -n "$VITE_PID" ] && kill $VITE_PID 2>/dev/null
  [ -n "$TAIL_PID" ] && kill $TAIL_PID 2>/dev/null
  exit 0
}
trap cleanup SIGINT SIGTERM

# Kill existing processes on port (including children)
echo -e "${CYAN}Limpando porta $PORT...${NC}"
PIDS=$(lsof -t -i:$PORT -sTCP:LISTEN 2>/dev/null || true)
if [ -n "$PIDS" ]; then
  for P in $PIDS; do
    pkill -P "$P" 2>/dev/null || true
    kill -9 "$P" 2>/dev/null || true
  done
  sleep 1
fi

# Also kill any orphaned vite processes for this project
ORPHANS=$(pgrep -f "$FRONTEND_DIR/node_modules.*vite" 2>/dev/null || true)
if [ -n "$ORPHANS" ]; then
  echo -e "${YELLOW}Limpando processos orfaos do Vite...${NC}"
  kill -9 $ORPHANS 2>/dev/null || true
  sleep 1
fi

echo ""
echo -e "${BOLD}${CYAN}app-rdoapontamentos-vite${NC} - porta ${BOLD}$PORT${NC}"
echo -e "${DIM}proxy /api -> localhost:3000 (api-micro-sankhya)${NC}"
echo ""

# Check API Backend
if curl -sf http://localhost:3000/health >/dev/null 2>&1; then
  echo -e "${GREEN}✓ API backend respondendo em :3000${NC}"
else
  echo -e "${YELLOW}⚠ AVISO: API backend NAO responde em :3000${NC}"
  echo -e "${YELLOW}  Rode ./start-api.sh primeiro se precisar de dados do Sankhya${NC}"
fi
echo ""

# Install deps (só se necessário)
if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
  echo -e "${CYAN}Instalando dependencias (pela primeira vez)...${NC}"
  (cd "$FRONTEND_DIR" && pnpm i)
else
  # Opcional: checar se package.json é mais novo que node_modules
  echo -e "${DIM}Dependencias ja instaladas. Pulando 'pnpm i'...${NC}"
fi

# Start
echo -e "${CYAN}Iniciando Vite...${NC}"
cd "$FRONTEND_DIR"
> "$LOG"
pnpm dev >> "$LOG" 2>&1 &
VITE_PID=$!

# Wait for ready
READY=false
for i in $(seq 1 15); do
  if curl -s http://localhost:$PORT > /dev/null 2>&1; then
    READY=true
    break
  fi
  # Verifica se o processo morreu precocemente
  if ! kill -0 $VITE_PID 2>/dev/null; then
    break
  fi
  sleep 1
done

if [ "$READY" = false ]; then
  echo -e "${RED}ERRO: Vite falhou ao iniciar.${NC}"
  echo -e "${RED}Ultimas 20 linhas do log ($LOG):${NC}"
  echo "--------------------------------------------------"
  tail -n 20 "$LOG"
  echo "--------------------------------------------------"
  
  # Check for common EMFILE error
  if grep -q "EMFILE" "$LOG"; then
    echo -e "\n${YELLOW}DICA: O erro EMFILE significa 'muitos arquivos abertos'.${NC}"
    echo -e "${YELLOW}Tente rodar: sudo sysctl -w fs.inotify.max_user_instances=512${NC}"
  fi
  
  exit 1
fi

echo ""
echo -e "${GREEN}Vite rodando!${NC}"
echo -e "  Local:  ${CYAN}http://localhost:$PORT${NC}"
echo -e "  Rede:   ${CYAN}http://$LOCAL_IP:$PORT${NC}"
echo -e "  PID:    $VITE_PID"
echo -e "  Log:    $LOG"
echo ""
echo -e "  ${BOLD}Paginas Principais${NC}"
echo -e "    Login:       ${CYAN}http://$LOCAL_IP:$PORT/login${NC}"
echo -e "    Hoje:        ${CYAN}http://$LOCAL_IP:$PORT/${NC}"
echo -e "    Historico:   ${CYAN}http://$LOCAL_IP:$PORT/meus-rdos${NC}"
echo ""
echo -e "${YELLOW}Ctrl+C para parar e ver logs em tempo real${NC}"
echo -e "${DIM}Logs sendo gravados em $LOG${NC}"
echo ""

# Stream logs in background
tail -f "$LOG" &
TAIL_PID=$!

# Espera o processo do Vite terminar
wait $VITE_PID
cleanup
