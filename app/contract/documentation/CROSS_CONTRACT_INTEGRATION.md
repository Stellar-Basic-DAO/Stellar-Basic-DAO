# Cross-Contract Integration Guide

> How the 4 sub-contracts interact on-chain via Soroban cross-contract calls.

## Architecture

```
┌──────────────┐     try_invoke_contract     ┌──────────────┐
│ stellar-dao  │ ──────────────────────────► │ stellar-dao  │
│  -escrow     │    fee_config, payout_route  │   -fee       │
└──────┬───────┘                              └──────────────┘
       │
       │ try_invoke_contract
       ▼
┌──────────────┐     try_invoke_contract     ┌──────────────┐
│ stellar-dao  │ ◄────────────────────────── │  External    │
│  -governance │    admin_check, pause_check  │  Oracle      │
└──────────────┘                              └──────────────┘
```

## Key Integration Points

### 1. Escrow → Fee Router (Payout Routing)

When `withdraw()` is called, the escrow contract queries the fee sub-contract:
- `get_fee_config()` — global fee basis points
- `get_per_asset_fee(token)` — per-asset fee overrides
- Calculates: platform_fee, arbiter_fee, collector_fee, net_payout

### 2. Escrow → Oracle (Dynamic Pricing)

When oracle fees are configured, `fetch_price()` calls:
- `oracle.lastprice()` via `try_invoke_contract`
- Returns `(price_micros, timestamp)`
- Staleness checked against `OracleFeeConfig.stale_threshold_secs`

### 3. Governance → Escrow (Pause/Admin)

Governance can control escrow via shared storage:
- `set_paused()` — global pause flag
- `set_pause_flags()` — granular feature pause
- Escrow checks pause state on every mutating operation

### 4. Stealth → Escrow (Deposit Verification)

Stealth deposits create escrow entries in shared storage:
- `register_ephemeral_key()` creates escrow with stealth address
- `stealth_withdraw()` verifies spend key and releases funds

## Testing

```rust
// Integration test example: escrow withdraw with fee routing
#[test]
fn test_escrow_withdraw_with_fee_routing() {
    let env = Env::default();
    // Deploy fee contract
    let fee_id = env.register_contract(None, FeeContract);
    // Deploy escrow contract
    let escrow_id = env.register_contract(None, EscrowContract);
    // Configure fees
    let fee_client = FeeContractClient::new(&env, &fee_id);
    fee_client.set_fee_config(&caller, &FeeConfig { fee_bps: 100, schema_version: 1 });
    // Deposit → withdraw → verify fee deduction
    // ...
}
```

## Safety Patterns

- **Always use `try_invoke_contract`** — never `invoke_contract` for cross-contract calls; graceful fallback on failure
- **Validate return values** — check for zero/negative prices, stale timestamps
- **Storage isolation** — each sub-contract owns its storage keys via `DataKey` prefix
- **No reentrancy risk** — Soroban single-threaded execution prevents reentrancy
