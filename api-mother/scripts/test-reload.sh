#!/usr/bin/env bash
# PM2 graceful shutdown verification script
set -e

API_URL="${API_URL:-http://localhost:3027}"
HEALTH_ENDPOINT="$API_URL/health/check-me"
CONCURRENT_REQUESTS="${CONCURRENT_REQUESTS:-20}"
PM2_APP_NAME="${PM2_APP_NAME:-dbexplorer-api}"
ERRORS=0

echo "=== Pre-flight Checks ==="

if ! bash -n "$0" 2>/dev/null; then
  echo "FAIL: Script has syntax errors"
  exit 1
fi
echo "  [ok] bash syntax valid"

if ! command -v curl >/dev/null 2>&1; then
  echo "FAIL: curl is not available. Install it: apt-get install curl"
  exit 1
fi
echo "  [ok] curl available: $(curl --version | head -1)"

if ! command -v pm2 >/dev/null 2>&1; then
  echo "FAIL: pm2 is not available. Install it: npm install -g pm2"
  exit 1
fi
echo "  [ok] pm2 available: $(pm2 --version)"

if ! pm2 list 2>/dev/null | grep -q "$PM2_APP_NAME"; then
  echo "FAIL: PM2 process '$PM2_APP_NAME' is not running."
  echo "      Start it with: pm2 start ecosystem.config.js"
  exit 1
fi
echo "  [ok] PM2 process '$PM2_APP_NAME' is running"

HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$HEALTH_ENDPOINT" 2>/dev/null || echo "000")
if [ "$HTTP_STATUS" != "200" ]; then
  echo "FAIL: API health endpoint returned $HTTP_STATUS (expected 200)."
  exit 1
fi
echo "  [ok] API health endpoint returns 200"

echo ""
echo "=== PM2 Graceful Shutdown Test ==="
echo "Target:   $HEALTH_ENDPOINT"
echo "Requests: $CONCURRENT_REQUESTS concurrent"
echo ""

TMPDIR_WORK=$(mktemp -d)
for i in $(seq 1 "$CONCURRENT_REQUESTS"); do
  curl -s -o "$TMPDIR_WORK/result-$i.json" -w "%{http_code}" \
    --max-time 10 \
    "$HEALTH_ENDPOINT" > "$TMPDIR_WORK/status-$i.txt" 2>"$TMPDIR_WORK/err-$i.txt" &
done

echo "Started $CONCURRENT_REQUESTS concurrent requests..."

sleep 0.2
echo "Triggering: pm2 reload $PM2_APP_NAME"
pm2 reload "$PM2_APP_NAME"

echo "Waiting for all requests to complete..."
wait

echo ""
echo "=== Results ==="

for i in $(seq 1 "$CONCURRENT_REQUESTS"); do
  STATUS=$(cat "$TMPDIR_WORK/status-$i.txt" 2>/dev/null || echo "MISSING")
  ERR=$(cat "$TMPDIR_WORK/err-$i.txt" 2>/dev/null)
  if [ "$STATUS" != "200" ] && [ "$STATUS" != "503" ]; then
    echo "  Request $i: FAILED (status=$STATUS, err=$ERR)"
    ERRORS=$((ERRORS + 1))
  else
    echo "  Request $i: OK (status=$STATUS)"
  fi
done

rm -rf "$TMPDIR_WORK"

echo ""
if [ "$ERRORS" -eq 0 ]; then
  echo "PASS: All $CONCURRENT_REQUESTS requests completed (200 or 503). Zero dropped."
else
  echo "FAIL: $ERRORS request(s) dropped (connection reset or timeout)."
  exit 1
fi
