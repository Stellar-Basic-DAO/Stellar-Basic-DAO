# Soroban Smart Contract Reference

> **Complete technical reference for the `RustAcademyContract` Soroban smart contract deployed on Stellar.**

---

## Overview

RustAcademy uses a single monolithic Soroban contract (`RustAcademyContract`) compiled to a `wasm32-unknown-unknown` WASM artifact. The monolithic design avoids cross-contract call overhead, reduces configuration complexity, and simplifies upgrades — a single `upgrade()` call swaps the entire platform's on-chain logic.

- **Contract name:** `RustAcademyContract`
- **SDK version:** Soroban SDK 23
- **Rust edition:** 2021
- **Crate type:** `cdylib` + `rlib`
- **Location:** `app/contract/contracts/Folder/`

---

## Core Design Principles

1. **No floating-point arithmetic** — all token amounts use `i128` (Stellar native precision).
2. **Bounded execution** — all operations publish explicit resource envelopes via `get_escrow_operation_limits()`.
3. **Replay protection** — per-signer nonces prevent reuse of off-chain signatures.
4. **Emergency safety** — irreversible `activate_emergency_mode()` freezes all state on detection of an exploit.
5. **Upgrade safety** — gated upgrade lifecycle (`start_upgrade → upgrade → complete_upgrade`) with time-windowed allowance.
6. **Event-first observability** — every state change emits an on-chain event with stable `event_type_id`.

---

## Asset Support

The contract accepts both **Native XLM** and any **SAC (Stellar Asset Contract) token** (e.g., USDC, AQUA, yXLM) using Soroban's standard token interface. No wrap/unwrap logic is required.

All amounts are normalized to **7 decimal places** (`i128` base units where `1 XLM = 10_000_000` stroops).

---

## Escrow State Machine

```
                 deposit()
                    │
                    ▼
              ┌──────────┐
              │  Pending │
              └─────┬────┘
        ┌───────────┼───────────┐
        │           │           │
        ▼           ▼           ▼
    withdraw()   refund()   dispute()
        │           │           │
        ▼           ▼           ▼
    ┌───────┐  ┌──────────┐  ┌──────────┐
    │ Spent │  │ Refunded │  │ Disputed │
    └───────┘  └──────────┘  └────┬─────┘
                            ┌─────┴──────┐
                            ▼            ▼
                         Spent       Refunded
                     (pay recip)  (pay owner)
```

**State transitions are enforced on-chain** — no external code can bypass them.


---

## Contract Function Reference

### Escrow Operations

#### `deposit(token, amount, owner, salt, timeout_secs, arbiter) → BytesN<32>`

Creates an escrow entry. Funds are transferred from `owner` to the contract. Returns the 32-byte commitment hash (KECCAK256 of `owner || amount || salt`).

| Parameter | Type | Notes |
|---|---|---|
| `token` | `Address` | Token contract address (XLM native or SAC) |
| `amount` | `i128` | Must be positive |
| `owner` | `Address` | Must authorize |
| `salt` | `Bytes` | 0–1024 bytes for uniqueness |
| `timeout_secs` | `u64` | Seconds until expiry; 0 = no expiry |
| `arbiter` | `Option<Address>` | Optional dispute arbiter |

**Errors:** `InvalidAmount`, `InvalidSalt`, `ContractPaused`, `CommitmentAlreadyExists`

---

#### `deposit_partial(token, amount_due, initial_payment, owner, salt, timeout_secs, arbiter) → BytesN<32>`

Creates an escrow where `initial_payment` is less than `amount_due`. The balance can be settled over time via `partial_payment()`.

---

#### `deposit_with_arbiters(token, amount, owner, salt, timeout_secs, arbiters, threshold) → BytesN<32>`

Creates an escrow with M-of-N multi-sig dispute resolution. `threshold` of the `arbiters` must vote to resolve a dispute.

**Constraints:** max 10 arbiters, no duplicates, `1 ≤ threshold ≤ len(arbiters)`.

---

#### `withdraw(token, amount, commitment, to, salt) → bool`

Releases escrowed funds to `to`. The commitment is re-derived from `(to, amount, salt)` and verified on-chain.

**Errors:** `CommitmentMismatch`, `EscrowExpired`, `AlreadySpent`

---

#### `refund(commitment, caller) → ()`

Returns funds to the original owner after the escrow has expired (`current_time ≥ expires_at`).

**Errors:** `EscrowNotExpired`, `InvalidOwner`, `AlreadySpent`

---

#### `partial_payment(commitment, payer, payment_amount) → ()`

Increments `amount_paid` on an existing escrow. Emits `PartialPayment` event. Emits `EscrowFinalized` if payment completes the escrow.

**Errors:** `Overpayment`, `CommitmentNotFound`, `AlreadySpent`

---

### Dispute Operations

#### `dispute(commitment) → ()`

Locks a `Pending` escrow into `Disputed` state. Any participant can call this. Requires an arbiter to have been assigned at deposit time.

#### `vote_for_dispute(caller, commitment, resolve_for_owner) → ()`

Records an arbiter's vote on a disputed escrow. Each arbiter can vote once.

#### `resolve_dispute(caller, commitment, resolve_for_owner, recipient) → ()`

Single-arbiter resolution. Transfers funds to `recipient` or refunds the owner depending on `resolve_for_owner`.

#### `resolve_dispute_multi_sig(commitment, recipient) → ()`

Executes multi-sig resolution once the threshold is met. Outcome determined by majority vote.

#### `resolve_expired_dispute(commitment) → ()`

Auto-resolves a dispute that has exceeded the configured timeout. Deterministic outcome based on `DisputeExpiryAction`.

---

### Privacy Operations

#### `set_privacy(owner, enabled) → ()`

Enables or disables privacy for an account. When enabled, `get_escrow_details()` hides `amount_due`, `amount_paid`, and `owner` from non-owners.

#### `enable_privacy(account, privacy_level) → bool`

Legacy numeric privacy level API. Records level and appends to history.

#### `register_ephemeral_key(params: StealthDepositParams) → BytesN<32>`

Stealth deposit flow (Privacy v2). The sender computes a one-time stealth address off-chain:
```
shared_secret   = SHA-256(eph_pub || spend_pub)
stealth_address = SHA-256(spend_pub || shared_secret)
```
The contract re-derives and verifies the stealth address on-chain, then locks funds under it. The recipient's real address is never recorded on-chain.

#### `stealth_withdraw(recipient, eph_pub, spend_pub, stealth_address) → bool`

Recipient proves ownership by supplying matching keys. Contract re-derives the stealth address to verify.

---

### Admin & Governance Operations

#### `initialize(admin) → ()`

One-time initialization. Sets the contract admin.

#### `set_paused(caller, new_state) → ()`

Global pause toggle. **Admin only.**

#### `pause_features(caller, mask) → ()` / `unpause_features(caller, mask) → ()`

Granular feature pause via bitmask. Specific operations (deposits, withdrawals, refunds, etc.) can be paused individually.

#### `activate_emergency_mode(caller) → ()`

Irreversible emergency halt. **Admin only.** Once activated, all deposits, withdrawals, and refunds are frozen. Recovery requires a contract upgrade.

#### `set_fee_config(caller, config) → ()`

Sets global fee configuration (basis points). **Admin only.**

#### `set_per_asset_fee(caller, token, config) → ()`

Overrides fee configuration for a specific token. **Admin or Operator only.**

#### `rotate_fee_collector(caller, new_collector) → u32`

Rotates the active fee collector address. Returns the new rotation index. **Admin only.**

---

### Upgrade Operations

The upgrade lifecycle is gated by a time-windowed mechanism:

```
set_upgrade_window(start, end)
       ↓  [within window]
start_upgrade(new_version, new_wasm_hash)
       ↓
upgrade(new_wasm_hash)
       ↓
complete_upgrade(new_version)
```

Calling `upgrade()` without going through `start_upgrade()` is rejected with `UpgradeNotInProgress`.

---

## Error Code Reference

| Code | Name | Description |
|---|---|---|
| 100 | `InvalidAmount` | Amount is zero, negative, or otherwise invalid |
| 101 | `InvalidSalt` | Salt exceeds 1024 bytes |
| 200 | `Unauthorized` | Caller is not authorized for this operation |
| 201 | `AlreadyInitialized` | Contract has already been initialized |
| 202 | `InsufficientRole` | Caller lacks the required role |
| 300 | `ContractPaused` | Contract is globally paused |
| 302 | `CommitmentNotFound` | No escrow found for this commitment |
| 303 | `CommitmentAlreadyExists` | Escrow already exists for this commitment |
| 304 | `AlreadySpent` | Escrow is in a terminal state |
| 307 | `EscrowExpired` | Escrow has passed its expiry |
| 308 | `EscrowNotExpired` | Refund attempted before expiry |
| 313 | `OperationPaused` | This specific operation is paused |
| 316 | `ReentrancyDetected` | Reentrant hook callback detected |
| 326 | `InvalidThreshold` | M-of-N threshold configuration is invalid |
| 400 | `StealthAddressMismatch` | Stealth address derivation mismatch |
| 401 | `StealthAddressAlreadyUsed` | Stealth address already has a deposit |
| 500 | `NonceAlreadyUsed` | Replay protection: nonce already consumed |
| 501 | `SignatureExpired` | Signature's `valid_until` has passed |
| 502 | `UpgradeWindowNotActive` | Upgrade attempted outside the time window |
| 503 | `UpgradeAlreadyInProgress` | An upgrade is already in progress |
| 504 | `UpgradeNotInProgress` | No upgrade is in progress |
| 900 | `InternalError` | Unexpected internal contract error |


---

## Deployment Guide

### Testnet

```bash
# Build the WASM artifact
cd app/contract
cargo build --target wasm32-unknown-unknown --release

# Deploy
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
  --admin <ADMIN_ADDRESS>
```

### Mainnet Checklist

Before deploying to mainnet:

- [ ] All `cargo test` pass (≥90% coverage)
- [ ] Admin address is a **Stellar multisig account** (2-of-3 threshold minimum)
- [ ] `set_upgrade_window()` configured before first upgrade
- [ ] Emergency mode procedure documented and tested
- [ ] Fee configuration verified on testnet
- [ ] WASM hash pinned in client configurations
- [ ] `get_deployment_metadata()` returns expected version

### Network Configuration

| Network | Horizon RPC | Notes |
|---|---|---|
| Local sandbox | `http://localhost:8000` | `stellar local` |
| Testnet | `https://horizon-testnet.stellar.org` | Default for development |
| Futurenet | `https://horizon-futurenet.stellar.org` | Upcoming feature testing |
| Mainnet | `https://horizon.stellar.org` | Production — post-audit only |

---

## Fee Architecture

Fees are collected in basis points (bps) — `100 bps = 1%`. The fee is split among up to three recipients:

```
fee_amount = deposit_amount × fee_bps / 10_000

arbiter_share   = fee_amount × arbiter_fee.numerator / arbiter_fee.denominator
platform_share  = fee_amount × platform_fee.numerator / platform_fee.denominator
collector_share = fee_amount - arbiter_share - platform_share
```

Per-asset fee overrides take precedence over the global fee config. Configure via `set_per_asset_fee()`.

---

## Security Notes

- **No floating-point:** All arithmetic uses `i128` to avoid precision loss.
- **Reentrancy guard:** `hook::assert_not_reentrant()` protects hook-invoking entry points.
- **Access model:** Four access classes — Admin, Operator, Owner, Public (read-only). See `lib.rs` for the full access table.
- **Emergency mode:** Once activated, it cannot be undone without a contract upgrade.
- **Upgrade gating:** WASM upgrades require an active time window set by the admin.
- **Privacy model:** Amount commitments use KECCAK256 (deterministic, not zero-knowledge). Stealth deposits provide sender-unlinkability at the chain level.
