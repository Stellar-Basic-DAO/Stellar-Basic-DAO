# Soroban Smart Contracts — Technical Reference

> **Last updated**: 2026-08-08 | **SDK version**: Soroban SDK v23 | **Protocol**: 27

## Architecture Overview

Stellar Basic DAO uses a **modular 4-contract architecture** deployed on Stellar's Soroban smart contract platform. The original monolithic contract (164KB) exceeded Soroban deployment limits and was split into independent sub-contracts, each sharing a common foundational crate.

### Sub-contracts

| Contract | Size | Testnet ID |
|:---|---|:---|
| `stellar-dao-escrow` | 84KB | `CARWR7ZW426KQSPJDWVD756AMKFFGNWFEHE77WYK3ESDTW6NDBY27PMF` |
| `stellar-dao-governance` | 85KB | `CDR27RYZ7LWFUIO5IJMLGAW6AQ7H6P2SB7JYRRIHJ5JF24E44RLLVAPF` |
| `stellar-dao-fee` | 47KB | `CBYSO64OUMCCTSTP4F3P5P6ZCSG5BJKUN6TNOWWIP6YKF2XAQ5Z5LBNU` |
| `stellar-dao-stealth` | 55KB | `CBQQ7MXKTEZOV2CIZBFRAYDL5YP6XIXRYJQC3CU7X5IEX3SQGARKFWBD` |

### Shared Crate (`stellar-dao-shared`)

A `no_std` Rust library providing foundational types used by all 4 sub-contracts:
- **errors.rs** — `StellarBasicDAOError` (codes 100-699), `GovernanceError`, `EscrowError`
- **types.rs** — `EscrowEntry`, `FeeConfig`, `Role`, `ProposalAction`, `DeploymentMetadata`, etc.
- **storage.rs** — Persistent storage keys, get/set helpers, TTL management
- **events.rs** — Event schema v2 with stable `event_type_id` values
- **nonce.rs** — Per-signer nonce replay protection
- **commitment.rs** — Amount commitment hashing (BLAKE3)
- **escrow_id.rs** — Deterministic escrow ID derivation

---

## Core Principles

1. **Trustless Escrow** — All XLM rewards are held in Soroban escrow, released only when conditions are met
2. **Financial Invariants** — 10 documented invariants guarantee conservation of value, no double settlement, and valid state transitions
3. **Modular Independence** — Each sub-contract is independently deployable and upgradeable
4. **Cross-contract Safety** — Oracle calls and cross-contract invocations use `try_invoke_contract` with graceful fallback
5. **Privacy by Design** — Privacy-aware escrow views hide sensitive fields from unauthorized callers
6. **On-chain Governance** — M-of-N multisig thresholds gate all privileged operations

### Asset Support

- **Native XLM** — Primary reward and fee token
- **SAC Tokens** — USDC, AQUA, yXLM via Stellar Asset Contracts
- **Path Payments** — Cross-asset reward distribution via Stellar path payments

---

## State Machines

### Escrow State Machine

```
[*] → Pending ──┬──→ Spent (withdraw)
                ├──→ Refunded (refund after expiry)
                └──→ Disputed ──┬──→ Spent (resolve for recipient)
                                └──→ Refunded (resolve for owner)
```

### Governance Proposal Lifecycle

```
create_proposal() → Pending → approve_proposal() [×N] → Executable → execute_proposal() → Executed
                          └──→ cancel_proposal() → Cancelled
```

---

## Error Code Reference

| Range | Category |
|:---|---|
| 100-199 | General/validation errors |
| 200-299 | Auth/admin errors |
| 300-399 | Escrow lifecycle errors |
| 400-499 | Fee/payment errors |
| 500-599 | Dispute resolution errors |
| 600-699 | Governance errors |

---

## Deployment

### Prerequisites
- Rust stable toolchain with `wasm32-unknown-unknown` target
- Stellar CLI (latest)
- Binaryen/wasm-opt ≥ v120

### Build & Optimize

```bash
cd app/contract
cargo build --target wasm32-unknown-unknown --release -p stellar-dao-escrow
wasm-opt --disable-reference-types --disable-exception-handling \
  --disable-simd --disable-multivalue --disable-bulk-memory \
  -Oz target/wasm32-unknown-unknown/release/stellar_dao_escrow.wasm \
  -o target/wasm32-unknown-unknown/release/stellar_dao_escrow.optimized.wasm
```

### Deploy

```bash
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/stellar_dao_escrow.optimized.wasm \
  --source deployer --network testnet
```

Or use the automated script: `bash scripts/deploy-testnet.sh`

### CI/CD

The `.github/workflows/contract-deploy.yml` workflow handles multi-contract matrix builds with wasm-opt optimization and per-contract deployment.

---

## Security

- **10 Financial Invariants** — See `docs/INVARIANTS.md`
- **Reentrancy Guards** — Protected entry points use hook-based reentrancy detection
- **Nonce Replay Protection** — Per-signer nonces prevent transaction replay
- **Schema Versioning** — Storage records include `schema_version` for safe migrations
- **Upgrade Gating** — Time-windowed upgrade safety with rollback hashes (Issue #432)
- **Privacy Views** — Sensitive fields gated behind caller authorization
- **Error Handling** — All cross-contract calls use `try_invoke_contract` with graceful fallback

---

## Event Schema (v2)

All events carry stable `event_type_id`, `schema_version`, `ledger_sequence`, and `timestamp` fields for reliable indexer consumption.

| Domain | Event | ID |
|:---|---|:---|
| Escrow | EscrowDeposited | 1 |
| Escrow | EscrowWithdrawn | 2 |
| Escrow | EscrowRefunded | 3 |
| Escrow | EscrowDisputed | 4 |
| Dispute | ArbiterVoteCast | 10 |
| Dispute | DisputeResolved | 11 |
| Admin | AdminChanged | 40 |
| Admin | ContractInitialized | 41 |
| Admin | UpgradeStarted | 53 |
| Admin | UpgradeCompleted | 54 |

---

## Testing

- **250+ contract tests** across 17 test files
- Fuzz tests for randomized input validation
- Benchmark tests for gas/cost profiling
- Upgrade safety tests (Issue #432)
- Coverage tests for error paths
- Run: `cd app/contract && cargo test`
