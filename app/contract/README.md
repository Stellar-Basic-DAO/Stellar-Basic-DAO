# ⚡ RustAcademy — Soroban Smart Contract

> Trustless escrow, fee routing, DAO governance, and privacy controls on Stellar.

[![Soroban SDK](https://img.shields.io/badge/Soroban%20SDK-23-orange)](https://soroban.stellar.org)
[![Rust](https://img.shields.io/badge/Rust-stable-orange?logo=rust)](https://www.rust-lang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE)
[![Network](https://img.shields.io/badge/Network-Stellar%20Testnet%2FMainnet-blueviolet)](https://stellar.org)

---

## Overview

`RustAcademyContract` is a single monolithic Soroban WASM contract that manages all on-chain logic for the RustAcademy platform:

| Module | Responsibility |
|---|---|
| **Escrow** | Deposit, withdraw, refund, partial payments |
| **Dispute** | Single-arbiter and M-of-N multi-sig dispute resolution |
| **Fee Router** | Basis-point fees with per-asset overrides and collector rotation |
| **Privacy** | Boolean and numeric privacy levels; stealth address deposits |
| **Governance** | M-of-N multisig proposal lifecycle for all privileged actions |
| **Admin** | Role management, pause flags, emergency mode |
| **Upgrade** | Time-windowed gated WASM upgrades |
| **Metadata** | Health checks, version info, feature flags, schema compatibility |

---

## Module Reference

### Escrow Module (`escrow.rs`)

The core payment primitive. All funds are held in on-chain escrow until a condition is met.

**State machine:**
```
Pending → Spent     (withdraw with valid proof)
        → Refunded  (refund after expires_at)
        → Disputed  → Spent / Refunded (arbiter resolves)
```

**Entry points:**
```rust
deposit(token, amount, owner, salt, timeout_secs, arbiter) → BytesN<32>
deposit_with_commitment(from, token, amount, commitment, timeout_secs, arbiter) → ()
deposit_partial(token, amount_due, initial_payment, owner, salt, timeout_secs, arbiter) → BytesN<32>
deposit_with_arbiters(token, amount, owner, salt, timeout_secs, arbiters, threshold) → BytesN<32>
withdraw(_token, amount, commitment, to, salt) → bool
refund(commitment, caller) → ()
partial_payment(commitment, payer, payment_amount) → ()
```

---

### Dispute Module (`dispute.rs`)

Handles single-arbiter and M-of-N multi-sig arbitration.

```rust
dispute(commitment) → ()
vote_for_dispute(caller, commitment, resolve_for_owner) → ()
resolve_dispute(caller, commitment, resolve_for_owner, recipient) → ()
resolve_dispute_multi_sig(commitment, recipient) → ()
resolve_expired_dispute(commitment) → ()
set_dispute_timeout(caller, timeout_secs) → ()
set_dispute_expiry_action(caller, action) → ()
```

---

### Fee Router (`fee_router.rs`)

Collects platform fees at withdrawal time and distributes them to up to 3 recipients (arbiter, platform, collector).

```
fee_amount = amount × fee_bps / 10_000

Per-asset config overrides global config for a specific token.
Fee split: arbiter_fee + platform_fee + collector_fee = fee_amount
```

**Entry points:**
```rust
set_fee_config(caller, config) → ()
set_per_asset_fee(caller, token, config) → ()
get_fee_config() → FeeConfig
get_per_asset_fee(token) → Option<PerAssetFeeConfig>
rotate_fee_collector(caller, new_collector) → u32
get_active_fee_collector() → Option<Address>
```

---

### Privacy Module (`privacy.rs` + `stealth.rs`)

Two privacy levels:

**Level 1 — Profile privacy:** When enabled, `get_escrow_details()` hides `amount_due`, `amount_paid`, and `owner` from non-owners.

**Level 2 — Stealth deposits:** Sender computes a one-time stealth address off-chain. The recipient's real address is never recorded on-chain.

```
shared_secret   = SHA-256(eph_pub || spend_pub)
stealth_address = SHA-256(spend_pub || shared_secret)
```

---

### Governance Module (`governance.rs`)

M-of-N multisig DAO governance. All privileged actions are gated behind proposals.

**Proposal lifecycle:**
```
create_proposal(action, nonce, valid_until) → BytesN<32>
approve_proposal(caller, proposal_id) → ()
execute_proposal(proposal_id) → ()           ← any caller
cancel_proposal(caller, proposal_id) → ()
```

**Gated actions:** `SetPaused`, `SetPauseFlags`, `UpgradeContract`, `SetFeeConfig`, `SetPerAssetFee`, `SetPlatformWallet`, `SetAdmin`, `GrantRole`, `RevokeRole`, `UpdateSignerSet`

**Read-only queries:**
```rust
get_signer_set() → Vec<Address>
get_governance_threshold() → u32
get_governance_proposal(proposal_id) → Option<GovernanceProposal>
is_governance_signer(address) → bool
```

---

### Metadata API (`metadata.rs`)

Read-only contract introspection. No auth required.

```rust
health_check() → bool
get_deployment_metadata() → DeploymentMetadata
get_contract_health() → ContractHealth
get_feature_flags() → FeatureFlags
get_upgrade_state() → UpgradeState
get_supported_versions() → SupportedVersions
check_schema_compatibility(contract_version, event_schema_version) → SchemaCompatibility
get_pause_flags() → u64
```

---

## On-Chain Event Schema

All events carry a **stable `event_type_id`** that never changes across releases. Indexers must use this ID as the primary routing key.

| Domain | Event | ID |
|---|---|---|
| Escrow | `EscrowDeposited` | 1 |
| Escrow | `EscrowWithdrawn` | 2 |
| Escrow | `EscrowRefunded` | 3 |
| Escrow | `EscrowDisputed` | 4 |
| Escrow | `EscrowFinalized` | 5 |
| Escrow | `PartialPayment` | 6 |
| Dispute | `ArbiterVoteCast` | 10 |
| Dispute | `DisputeResolved` | 11 |
| Dispute | `DisputeAutoResolved` | 13 |
| Privacy | `PrivacyToggled` | 20 |
| Stealth | `EphemeralKeyRegistered` | 30 |
| Stealth | `StealthWithdrawn` | 31 |
| Admin | `AdminChanged` | 40 |
| Admin | `ContractInitialized` | 41 |
| Admin | `ContractPaused` | 43 |
| Admin | `ContractUpgraded` | 44 |
| Admin | `EmergencyModeActivated` | 45 |
| Admin | `FeeConfigChanged` | 47 |
| Admin | `UpgradeStarted` | 53 |
| Admin | `UpgradeCompleted` | 54 |
| Governance | `ProposalCreated` | — |
| Governance | `ProposalApproved` | — |
| Governance | `ProposalExecuted` | — |
| Governance | `ProposalCancelled` | — |

---

## Build

```bash
# Build WASM artifact
cargo build --target wasm32-unknown-unknown --release

# Run all tests
cargo test

# Run with logs
cargo test -- --nocapture

# Build with logs (debug assertions)
cargo build --target wasm32-unknown-unknown --profile release-with-logs
```

---

## Deploy

```bash
# Deploy to Stellar Testnet
stellar contract deploy \
  --network testnet \
  --source <DEPLOYER_SECRET_KEY> \
  --wasm target/wasm32-unknown-unknown/release/rust_academy.wasm

# Initialize
stellar contract invoke \
  --network testnet \
  --id <CONTRACT_ID> \
  --source <ADMIN_SECRET_KEY> \
  -- initialize \
  --admin <ADMIN_STELLAR_ADDRESS>

# Set governance signers (3-of-5 example)
stellar contract invoke \
  --network testnet \
  --id <CONTRACT_ID> \
  --source <SIGNER_SECRET_KEY> \
  -- create_proposal \
  --proposer <SIGNER_ADDRESS> \
  --nonce 1 \
  --valid_until <TIMESTAMP_PLUS_7_DAYS>
```

---

## Security Principles

| Principle | Implementation |
|---|---|
| No floating-point | All amounts use `i128` (Stellar stroops) |
| Bounded execution | `get_escrow_operation_limits()` publishes worst-case budgets |
| Replay protection | Per-signer nonces via `nonce::verify_and_consume()` |
| Reentrancy guard | `hook::assert_not_reentrant()` on hook-invoking paths |
| Emergency mode | Irreversible freeze on exploit detection |
| Upgrade gating | Time-windowed `start_upgrade → upgrade → complete_upgrade` |
| Governance | M-of-N multisig for all privileged actions |
| Privacy | Stealth deposits hide recipient identity on-chain |

---

## Testing Requirements

All contract modules must maintain **≥ 90% test coverage** before mainnet deployment.

Test categories:
- **Unit tests** — per-module logic in `*_test.rs` files
- **Integration tests** — cross-module flows in `test.rs`
- **Fuzz tests** — property-based tests in `fuzz_test.rs` (using `proptest`)
- **Bench tests** — resource budget verification in `bench_test.rs`

---

## Error Code Reference

See [`src/errors.rs`](src/errors.rs) for the complete list. Key bands:

| Range | Category |
|---|---|
| 100–199 | Validation failures |
| 200–299 | Auth / admin failures |
| 300–399 | State / escrow / commitment violations |
| 400–499 | Stealth address errors |
| 500–514 | Replay protection + governance |
| 900–999 | Internal / unexpected conditions |
