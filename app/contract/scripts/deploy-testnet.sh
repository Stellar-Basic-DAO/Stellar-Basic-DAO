#!/usr/bin/env bash
#
# Deploy Stellar Basic DAO Contract to Testnet
# =============================================
#
# Prerequisites:
#   1. Stellar CLI installed: cargo install stellar-cli --locked
#   2. Testnet account funded via Friendbot
#   3. DEPLOYER_SECRET_KEY and ADMIN_PUBLIC_KEY set in environment
#
# Usage:
#   export DEPLOYER_SECRET_KEY="S..."
#   export ADMIN_PUBLIC_KEY="G..."
#   bash scripts/deploy-testnet.sh
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONTRACT_DIR="$(dirname "$SCRIPT_DIR")"
WASM_PATH="$CONTRACT_DIR/target/wasm32-unknown-unknown/release/stellar_basic_dao.wasm"

# ── Validation ─────────────────────────────────────────────────────────
if [ -z "${DEPLOYER_SECRET_KEY:-}" ]; then
  echo "❌ DEPLOYER_SECRET_KEY is not set. Export it before running."
  exit 1
fi

if [ -z "${ADMIN_PUBLIC_KEY:-}" ]; then
  echo "❌ ADMIN_PUBLIC_KEY is not set. Export it before running."
  exit 1
fi

# ── Build WASM ─────────────────────────────────────────────────────────
echo "🔨 Building release WASM..."
cd "$CONTRACT_DIR"
cargo build --target wasm32-unknown-unknown --release

if [ ! -f "$WASM_PATH" ]; then
  echo "❌ WASM artifact not found at $WASM_PATH"
  exit 1
fi

WASM_HASH=$(sha256sum "$WASM_PATH" | awk '{print $1}')
echo "✅ WASM built: $WASM_PATH ($(du -h "$WASM_PATH" | cut -f1))"
echo "   Hash: $WASM_HASH"

# ── Deploy ─────────────────────────────────────────────────────────────
echo ""
echo "🚀 Deploying to Stellar Testnet..."

CONTRACT_ID=$(stellar contract deploy \
  --wasm "$WASM_PATH" \
  --source "$DEPLOYER_SECRET_KEY" \
  --network testnet)

echo "✅ Contract deployed!"
echo "   Contract ID: $CONTRACT_ID"

# ── Initialize ─────────────────────────────────────────────────────────
echo ""
echo "🔧 Initializing contract with admin $ADMIN_PUBLIC_KEY..."

stellar contract invoke \
  --id "$CONTRACT_ID" \
  --source "$DEPLOYER_SECRET_KEY" \
  --network testnet \
  -- \
  initialize \
  --admin "$ADMIN_PUBLIC_KEY"

echo "✅ Contract initialized!"

# ── Health Check ───────────────────────────────────────────────────────
echo ""
echo "🏥 Running health check..."

HEALTH=$(stellar contract invoke \
  --id "$CONTRACT_ID" \
  --network testnet \
  -- \
  health_check 2>&1) || true

echo "   Health: $HEALTH"

# ── Summary ────────────────────────────────────────────────────────────
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  Deployment Summary"
echo "═══════════════════════════════════════════════════════════"
echo "  Network:     testnet"
echo "  Contract ID: $CONTRACT_ID"
echo "  WASM Hash:   $WASM_HASH"
echo "  Admin:       $ADMIN_PUBLIC_KEY"
echo "  Deployed at: $TIMESTAMP"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "📝 Update environment-registry.toml with the contract ID above."
