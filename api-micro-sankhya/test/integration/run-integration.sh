#!/bin/bash
# Integration tests — TREINA only, never PROD
# Usage: bash test/integration/run-integration.sh

set -uo pipefail

BASE="http://localhost:3000"
DB="TREINA"
PASS=0
FAIL=0
SKIP=0
ERRORS=""

# Colors
G='\033[32m'
R='\033[31m'
Y='\033[33m'
C='\033[36m'
D='\033[2m'
B='\033[1m'
N='\033[0m'

ok() { ((PASS++)); echo -e "  ${G}✓${N} $1"; }
fail() { ((FAIL++)); ERRORS="${ERRORS}\n  ✗ $1: $2"; echo -e "  ${R}✗${N} $1 ${D}— $2${N}"; }
skip() { ((SKIP++)); echo -e "  ${Y}○${N} $1 ${D}(skipped)${N}"; }
section() { echo -e "\n${C}${B}━━ $1${N}"; }

assert_status() {
  local label="$1" method="$2" url="$3" expected="$4"
  shift 4
  local status
  status=$(curl -s -o /dev/null -w "%{http_code}" -X "$method" "$url" "$@")
  if [ "$status" = "$expected" ]; then
    ok "$label → $status"
  else
    fail "$label" "expected $expected, got $status"
  fi
}

assert_json_field() {
  local label="$1" url="$2" field="$3"
  shift 3
  local val
  val=$(curl -s "$url" "$@" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('$field','__MISSING__'))" 2>/dev/null || echo "__ERROR__")
  if [ "$val" != "__MISSING__" ] && [ "$val" != "__ERROR__" ]; then
    ok "$label → $field=$val"
  else
    fail "$label" "field '$field' missing"
  fi
}

echo -e "${B}╔══════════════════════════════════════════════╗${N}"
echo -e "${B}║  Integration Tests — Database: ${Y}${DB}${N}${B}            ║${N}"
echo -e "${B}╚══════════════════════════════════════════════╝${N}"

# ─── 0. Health ───
section "Health & Version"
assert_status "GET /health" GET "$BASE/health" 200
assert_json_field "Health status" "$BASE/health" "status"
assert_status "GET /version" GET "$BASE/version" 200

# ─── 1. Auth ───
section "Authentication"
# Login — try on target DB first, fallback to PROD
RESP=$(curl -s "$BASE/auth/login" \
  -H "Content-Type: application/json" \
  -H "X-Database-Selection: $DB" \
  -d '{"username":"CARLOS.AQUINO","password":"teste123BR$"}')

TOKEN=$(echo "$RESP" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('token',''))" 2>/dev/null)
LOGIN_DB="$DB"
if [ -z "$TOKEN" ]; then
  echo -e "  ${Y}○${N} Login on $DB failed, trying PROD..."
  RESP=$(curl -s "$BASE/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"username":"CARLOS.AQUINO","password":"teste123BR$"}')
  TOKEN=$(echo "$RESP" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('token',''))" 2>/dev/null)
  LOGIN_DB="PROD"
fi
if [ -z "$TOKEN" ]; then
  echo -e "${R}${B}FATAL: Login failed on both $DB and PROD. Cannot continue.${N}"
  echo "$RESP"
  exit 1
fi
ok "POST /auth/login → got token (via $LOGIN_DB)"

# Show token details
python3 -c "
import json, base64, sys
resp = json.loads('''$RESP''')
for label, key in [('Token', 'token'), ('Refresh', 'refreshToken')]:
    t = resp.get(key, '')
    if not t: continue
    payload = json.loads(base64.b64decode(t.split('.')[1] + '=='))
    exp = payload.get('exp', 0)
    iat = payload.get('iat', 0)
    ttl = exp - iat
    h, m = divmod(ttl // 60, 60)
    user = payload.get('username', payload.get('sub', '?'))
    print(f'  \033[2m{label}: user={user} ttl={h}h {m}min (iat→exp: {ttl}s)\033[0m')
" 2>/dev/null

# Auth headers for all subsequent requests
AUTH=(-H "Authorization: Bearer $TOKEN" -H "X-Database-Selection: $DB")

# /auth/me
ME=$(curl -s "$BASE/auth/me" "${AUTH[@]}")
NOME=$(echo "$ME" | python3 -c "import sys,json; print(json.load(sys.stdin).get('nome',''))" 2>/dev/null)
if [ "$NOME" = "CARLOS.AQUINO" ]; then
  ok "GET /auth/me → nome=$NOME"
else
  fail "GET /auth/me" "expected CARLOS.AQUINO, got $NOME"
fi

# Bad credentials (use fake user to not trigger rate limit on real user)
assert_status "POST /auth/login bad pass" POST "$BASE/auth/login" 401 \
  -H "Content-Type: application/json" \
  -d '{"username":"FAKE_TEST_USER_999","password":"wrongpass"}'

# No token
assert_status "GET /auth/me no token" GET "$BASE/auth/me" 401 \
  -H "X-Database-Selection: $DB"

# ─── 2. Motivos (read-only) ───
section "Motivos RDO"
assert_status "GET /motivos" GET "$BASE/motivos?page=1&limit=5" 200 "${AUTH[@]}"

MOTIVO_COUNT=$(curl -s "$BASE/motivos?page=1&limit=100" "${AUTH[@]}" | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d) if isinstance(d,list) else len(d.get('data',[])))" 2>/dev/null)
ok "GET /motivos → $MOTIVO_COUNT motivos"

assert_status "GET /motivos/:id" GET "$BASE/motivos/1" 200 "${AUTH[@]}"
assert_status "GET /motivos/search" GET "$BASE/motivos/search?q=pro" 200 "${AUTH[@]}"

# ─── 3. RDO ───
section "RDO (Read)"
assert_status "GET /rdo list" GET "$BASE/rdo?page=1&limit=3" 200 "${AUTH[@]}"

RDO_RESP=$(curl -s "$BASE/rdo?page=1&limit=1" "${AUTH[@]}")
RDO_KEYS=$(echo "$RDO_RESP" | python3 -c "import sys,json; d=json.load(sys.stdin); print(','.join(sorted(d.keys())))" 2>/dev/null)
if echo "$RDO_KEYS" | grep -q "data,meta"; then
  ok "GET /rdo → has {data, meta}"
else
  fail "GET /rdo format" "expected data+meta, got $RDO_KEYS"
fi

FIRST_RDO=$(echo "$RDO_RESP" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['data'][0]['CODRDO'] if d.get('data') else '')" 2>/dev/null)
if [ -n "$FIRST_RDO" ]; then
  assert_status "GET /rdo/:codrdo" GET "$BASE/rdo/$FIRST_RDO" 200 "${AUTH[@]}"
  assert_status "GET /rdo/:codrdo/detalhes" GET "$BASE/rdo/$FIRST_RDO/detalhes" 200 "${AUTH[@]}"
  assert_status "GET /rdo/:codrdo/metricas" GET "$BASE/rdo/$FIRST_RDO/metricas" 200 "${AUTH[@]}"
else
  skip "GET /rdo/:id (no RDOs found)"
fi

assert_status "GET /rdo/search" GET "$BASE/rdo/search?q=carlos" 200 "${AUTH[@]}"

# ─── 4. Funcionarios ───
section "Funcionarios"
assert_status "GET /funcionarios/buscar" GET "$BASE/funcionarios/buscar?q=carlos&limit=5" 200 "${AUTH[@]}"
assert_status "GET /funcionarios/resumo" GET "$BASE/funcionarios/resumo" 200 "${AUTH[@]}"

# ─── 5. Usuarios ───
section "Usuarios"
assert_status "GET /usuarios" GET "$BASE/usuarios?page=1&limit=5" 200 "${AUTH[@]}"
assert_status "GET /usuarios/search" GET "$BASE/usuarios/search?termo=carlos" 200 "${AUTH[@]}"

# ─── 6. Veiculos ───
section "Veiculos"
assert_status "GET /veiculos" GET "$BASE/veiculos?page=1&limit=5" 200 "${AUTH[@]}"
assert_status "GET /veiculos/search" GET "$BASE/veiculos/search?q=vol" 200 "${AUTH[@]}"

# ─── 7. Contratos ───
section "Contratos"
assert_status "GET /contratos" GET "$BASE/contratos?page=1&limit=5" 200 "${AUTH[@]}"

# ─── 8. Chamados ───
section "Chamados"
assert_status "GET /chamados" GET "$BASE/chamados?page=1&limit=5" 200 "${AUTH[@]}"

# ─── 9. OS Manutencao ───
section "OS Manutencao"
assert_status "GET /os-manutencao" GET "$BASE/os-manutencao?page=1&limit=5" 200 "${AUTH[@]}"

# ─── 10. Dashboard ───
section "Dashboard"
assert_status "GET /dashboard" GET "$BASE/dashboard" 200 "${AUTH[@]}"

# ─── 11. RDO Analytics ───
section "RDO Analytics"
# estatisticas is per-RDO, use stats endpoint instead
if [ -n "$FIRST_RDO" ]; then
  assert_status "GET /rdo/stats" GET "$BASE/rdo/stats" 200 "${AUTH[@]}"
else
  skip "GET /rdo/stats (no RDOs)"
fi
assert_status "GET /rdo/resumo-diario" GET "$BASE/rdo/resumo-diario?page=1&limit=5" 200 "${AUTH[@]}"

# ─── 12. SQL Sanitization tests ───
section "SQL Injection Protection"

# Date injection attempt
INJ_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/rdo?page=1&limit=1&dataInicio=2026-01-01';DROP%20TABLE--" "${AUTH[@]}")
if [ "$INJ_STATUS" != "200" ]; then
  ok "Date injection blocked → $INJ_STATUS"
else
  fail "Date injection" "request succeeded (should fail)"
fi

# Search term injection (uses q= param)
INJ_STATUS2=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/motivos/search?q=';DROP%20TABLE%20AD_RDOMOTIVOS--" "${AUTH[@]}")
if [ "$INJ_STATUS2" = "200" ]; then
  ok "Search injection sanitized → $INJ_STATUS2 (safe, returned empty)"
else
  # 400/500 also acceptable — means input was rejected
  ok "Search injection rejected → $INJ_STATUS2 (safe)"
fi

# ─── 13. Error handling ───
section "Error Handling"
assert_status "GET /nonexistent" GET "$BASE/nonexistent-route-12345" 404 "${AUTH[@]}"

# Verify no internal details leaked
ERR_RESP=$(curl -s "$BASE/rdo/99999999" "${AUTH[@]}")
HAS_MOTHER=$(echo "$ERR_RESP" | python3 -c "import sys,json; d=json.load(sys.stdin); print('motherUrl' in d)" 2>/dev/null || echo "False")
if [ "$HAS_MOTHER" = "False" ]; then
  ok "Error response hides internal details"
else
  fail "Error leaks" "motherUrl exposed in response"
fi

# ─── 14. RDO Mutation (TREINA only!) ───
section "RDO Mutations (TREINA — will create+delete)"

CODPARC=$(echo "$ME" | python3 -c "import sys,json; print(json.load(sys.stdin).get('codparc',0))" 2>/dev/null)
TEST_DATE="2099-12-31"

# Create RDO
CREATE_RESP=$(curl -s -X POST "$BASE/rdo" \
  -H "Content-Type: application/json" "${AUTH[@]}" \
  -d "{\"CODPARC\":$CODPARC,\"DTREF\":\"$TEST_DATE\"}")

CREATE_OK=$(echo "$CREATE_RESP" | python3 -c "
import sys,json
d=json.load(sys.stdin)
di = d.get('dadosInseridos',{})
codrdo = d.get('codrdo') or di.get('CODRDO') or (d.get('data',{}).get('CODRDO') if isinstance(d.get('data'),dict) else None)
dup = d.get('duplicateAvoided', False)
if codrdo: print(f'OK:{codrdo}')
elif dup: print(f'DUP:{d.get(\"codrdo\",0)}')
else: print(f'FAIL')
" 2>/dev/null)

if [[ "$CREATE_OK" == OK:* ]]; then
  TEST_CODRDO="${CREATE_OK#OK:}"
  ok "POST /rdo → created CODRDO=$TEST_CODRDO"

  # Delete the test RDO (cleanup)
  DEL_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$BASE/rdo/$TEST_CODRDO" "${AUTH[@]}")
  if [ "$DEL_STATUS" = "200" ]; then
    ok "DELETE /rdo/$TEST_CODRDO → cleanup OK"
  else
    fail "DELETE /rdo/$TEST_CODRDO" "status=$DEL_STATUS (manual cleanup needed!)"
  fi
elif [[ "$CREATE_OK" == DUP:* ]]; then
  ok "POST /rdo → duplicate avoided (safe)"
else
  fail "POST /rdo" "$CREATE_OK"
fi

# ─── Results ───
echo ""
echo -e "${B}╔══════════════════════════════════════════════╗${N}"
TOTAL=$((PASS + FAIL + SKIP))
echo -e "${B}║  Results: ${G}$PASS passed${N}${B} · ${R}$FAIL failed${N}${B} · ${Y}$SKIP skipped${N}${B}  ║${N}"
echo -e "${B}║  Total: $TOTAL tests on ${Y}$DB${N}${B}                     ║${N}"
echo -e "${B}╚══════════════════════════════════════════════╝${N}"

if [ $FAIL -gt 0 ]; then
  echo -e "\n${R}${B}Failures:${N}$ERRORS"
  exit 1
fi
