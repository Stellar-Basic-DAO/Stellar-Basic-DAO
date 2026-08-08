#!/usr/bin/env bash
#
# Deploy Stellar Basic DAO Sub-contracts to Testnet
# ==================================================
#
# Builds and deploys all 4 sub-contracts to Stellar Testnet.
# Each sub-contract is independently deployable under the ~64KB Soroban limit.
#
# Prerequisites:
#   1. Stellar CLI v27+ installed
#   2. wasm-opt (binaryen) installed
#   3. Testnet account funded via Friendbot
#   4. DEPLOYER_SECRET_KEY and ADMIN_PUBLIC_KEY set in environment
#
# Usage:
#   export DEPLOYER_SECRET_KEY="S..."
#   export ADMIN_PUBLIC_KEY="G..."
#   bash scripts/deploy-testnet.sh
#
# Or deploy specific sub-contracts:
#   bash scripts/deploy-testnet.sh stealth fee
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONTRACT_DIR="$(dirname "$SCRIPT_DIR")"
RELEASE_DIR="$CONTRACT_DIR/target/wasm32-unknown-unknown/release"

# ── Configuration ─────────────────────────────────────────────────────
NETWORK="${STELLAR_NETWORK:-testnet}"
RPC_URL="${STELLAR_RPC_URL:-https://soroban-testnet.stellar.org}"
PASSPHRASE="${STELLAR_PASSPHRASE:-Test SDF Network ; September 2015}"

# Sub-contracts to deploy (all 4 by default)
CONTRACTS=("${@:-stellar-dao-escrow stellar-dao-governance stellar-dao-fee stellar-dao-stealth}")

echo "═══════════════════════════════════════════════════════════"
echo "  Stellar Basic DAO — Testnet Deployment"
echo "  Network: $NETWORK"
echo "  Contracts: ${CONTRACTS[*]}"
echo "═══════════════════════════════════════════════════════════"
echo ""

# ── Validation ─────────────────────────────────────────────────────────
if [ -z "${DEPLOYER_SECRET_KEY:-}" ]; then
  echo "❌ DEPLOYER_SECRET_KEY is not set. Export it before running."
  exit 1
fi

if ! command -v wasm-opt &>/dev/null; then
  echo "⚠️  wasm-opt not found. WASM optimization will be skipped."
  echo "   Install: curl -sL https://github.com/WebAssembly/binaryen/releases/download/version_120/binaryen-version_120-x86_64-linux.tar.gz | tar xz -C /tmp && cp /tmp/binaryen-version_120/bin/wasm-opt /usr/local/bin/"
  OPTIMIZE=false
else
  OPTIMIZE=true
fi

# ── Configure network ──────────────────────────────────────────────────
stellar network add "$NETWORK" \
  --rpc-url "$RPC_URL" \
  --network-passphrase "$PASSPHRASE" \
  2>/dev/null || echo "Network $NETWORK already configured"

# ── Build ──────────────────────────────────────────────────────────────
echo "🔨 Building all sub-contracts..."
cd "$CONTRACT_DIR"

for crate in "${CONTRACTS[@]}"; do
  echo "  → Building $crate..."
  cargo build --target wasm32-unknown-unknown --release -p "$crate"
done
echo "✅ Build complete"
echo ""

# ── Optimize ───────────────────────────────────────────────────────────
if [ "$OPTIMIZE" = true ]; then
  echo "⚡ Optimizing WASM artifacts..."
  for crate in "${CONTRACTS[@]}"; do
    # Map crate names (hyphens) to file names (underscores)
    crate_file="${crate//-/_}"
    WASM="$RELEASE_DIR/${crate_file}.wasm"
    OPT_WASM="$RELEASE_DIR/${crate_file}.optimized.wasm"

    if [ -f "$WASM" ]; then
      wasm-opt --disable-reference-types --disable-exception-handling \
        --disable-simd --disable-multivalue --disable-bulk-memory \
        -Oz "$WASM" -o "$OPT_WASM"
      SIZE=$(stat -c%s "$OPT_WASM" 2>/dev/null || stat -f%z "$OPT_WASM")
      echo "  $crate_file: ${SIZE} bytes"
      if [ "$SIZE" -gt 65536 ]; then
        echo "  ⚠️  $crate_file is ${SIZE} bytes (>64KB Soroban limit)"
      fi
    else
      echo "  ⚠️  $crate_file: WASM not found at $WASM"
    fi
  done
  echo ""
fi

# ── Deploy ─────────────────────────────────────────────────────────────
declare -A CONTRACT_IDS
FAILED=()

for crate in "${CONTRACTS[@]}"; do
  crate_file="${crate//-/_}"
  OPT_WASM="$RELEASE_DIR/${crate_file}.optimized.wasm"
  WASM="$RELEASE_DIR/${crate_file}.wasm"

  # Use optimized WASM if available, else raw
  if [ -f "$OPT_WASM" ]; then
    DEPLOY_WASM="$OPT_WASM"
  elif [ -f "$WASM" ]; then
    DEPLOY_WASM="$WASM"
  else
    echo "❌ $crate: No WASM artifact found"
    FAILED+=("$crate")
    continue
  fi

  echo "🚀 Deploying $crate to $NETWORK..."

  if CONTRACT_ID=$(stellar contract deploy \
    --wasm "$DEPLOY_WASM" \
    --source "$DEPLOYER_SECRET_KEY" \
    --network "$NETWORK" 2>&1); then
    CONTRACT_IDS["$crate"]="$CONTRACT_ID"
    WASM_HASH=$(sha256sum "$DEPLOY_WASM" | awk '{print $1}')
    echo "   ✅ Contract ID: $CONTRACT_ID"
    echo "   WASM Hash:     $WASM_HASH"
  else
    echo "   ❌ Deployment failed: $CONTRACT_ID"
    FAILED+=("$crate")
  fi
  echo ""
done

# ── Initialize Governance ──────────────────────────────────────────────
GOV_ID="${CONTRACT_IDS[stellar-dao-governance]:-}"
if [ -n "$GOV_ID" ] && [ -n "${ADMIN_PUBLIC_KEY:-}" ]; then
  echo "🔧 Initializing governance contract with admin $ADMIN_PUBLIC_KEY..."
  stellar contract invoke \
    --id "$GOV_ID" \
    --source "$DEPLOYER_SECRET_KEY" \
    --network "$NETWORK" \
    -- \
    initialize \
    --admin "$ADMIN_PUBLIC_KEY"
  echo "✅ Governance initialized"
  echo ""
elif [ -n "$GOV_ID" ]; then
  echo "ℹ️  ADMIN_PUBLIC_KEY not set — skipping governance initialization"
  echo "   Set it to initialize: export ADMIN_PUBLIC_KEY=\"G...\""
  echo ""
fi

# ── Health Checks ──────────────────────────────────────────────────────
echo "🏥 Running health checks..."
for crate in "${!CONTRACT_IDS[@]}"; do
  CID="${CONTRACT_IDS[$crate]}"
  echo -n "   $crate: "
  if HEALTH=$(stellar contract invoke \
    --id "$CID" \
    --network "$NETWORK" \
    -- \
    health_check 2>&1); then
    echo "✅"
  else
    echo "⚠️  $HEALTH"
  fi
done
echo ""

# ── Summary ────────────────────────────────────────────────────────────
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
echo "═══════════════════════════════════════════════════════════"
echo "  Deployment Summary — $TIMESTAMP"
echo "═══════════════════════════════════════════════════════════"
echo "  Network:     $NETWORK"
echo "═══════════════════════════════════════════════════════════"

for crate in "${!CONTRACT_IDS[@]}"; do
  echo "  $crate: ${CONTRACT_IDS[$crate]}"
done

if [ ${#FAILED[@]} -gt 0 ]; then
  echo "═══════════════════════════════════════════════════════════"
  echo "  ⚠️  Failed: ${FAILED[*]}"
fi

echo "═══════════════════════════════════════════════════════════"
echo ""
echo "📝 Update environment-registry.toml with the contract IDs above."
