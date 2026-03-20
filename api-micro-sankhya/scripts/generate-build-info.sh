#!/bin/bash
# Generate build-info.json with git and environment data
# Run this before deployment or as part of CI/CD

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
OUTPUT="$PROJECT_DIR/build-info.json"

COMMIT_HASH=$(git -C "$PROJECT_DIR" rev-parse HEAD 2>/dev/null || echo "unknown")
COMMIT_SHORT=$(git -C "$PROJECT_DIR" rev-parse --short HEAD 2>/dev/null || echo "unknown")
BRANCH=$(git -C "$PROJECT_DIR" rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
BUILD_DATE=$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")
NODE_VERSION=$(node --version 2>/dev/null || echo "unknown")
ENVIRONMENT="${NODE_ENV:-development}"

cat > "$OUTPUT" <<EOF
{
  "buildDate": "$BUILD_DATE",
  "commitHash": "$COMMIT_HASH",
  "commitShort": "$COMMIT_SHORT",
  "branch": "$BRANCH",
  "nodeVersion": "$NODE_VERSION",
  "environment": "$ENVIRONMENT"
}
EOF

echo "Build info generated at $OUTPUT"
cat "$OUTPUT"
