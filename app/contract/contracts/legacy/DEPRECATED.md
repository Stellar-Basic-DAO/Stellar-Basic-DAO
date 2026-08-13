# ⚠️ DEPRECATED — Legacy Monolithic Contract

> **This code has been moved to the [`legacy`](https://github.com/Stellar-Basic-DAO/Stellar-Basic-DAO/tree/legacy) branch.**

## What Happened

The original `StellarBasicDAOContract` was a **monolithic Soroban contract** (164 KB WASM) that contained all escrow, governance, stealth, and fee router logic in a single artifact.

In **v0.2.0** (August 2026), the monolithic contract was **modularized into 4 independent sub-contracts** plus a shared crate to meet Soroban's deployment size limits (~70 KB per contract).

## Where to Find Things

| Old Location (`contracts/Folder/src/`) | New Location |
|---|---|
| `lib.rs` (monolithic entry point) | Split across `escrow/src/lib.rs`, `governance/src/lib.rs`, `fee/src/lib.rs`, `stealth/src/lib.rs` |
| `escrow.rs`, `dispute.rs`, `batch.rs`, `hook.rs`, `privacy.rs` | `escrow/src/` |
| `governance.rs`, `admin.rs`, `metadata.rs` | `governance/src/` |
| `fee.rs`, `fee_router.rs`, `oracle.rs` | `fee/src/` |
| `stealth.rs` | `stealth/src/` |
| `errors.rs`, `types.rs`, `storage.rs`, `events.rs`, `nonce.rs`, `commitment.rs`, `escrow_id.rs` | `shared/src/` |
| `build.rs` | `governance/build.rs` |

## Accessing the Original Code

The complete monolithic contract (including all test files, test snapshots, and build configuration) is preserved on the **`legacy`** branch:

```bash
git checkout legacy
cd app/contract/contracts/Folder
```

## Why This Was Archived

1. **WASM Size:** The monolithic contract compiled to 164 KB, exceeding Soroban's practical deployment limit
2. **Deployment Independence:** Each sub-contract can be deployed, upgraded, and verified independently
3. **Clean Separation:** Escrow, governance, fee routing, and privacy are now distinct concerns with minimal cross-contract coupling
4. **Maintainability:** Smaller, focused codebases are easier to audit, test, and extend

## Migration Date

**Deprecated:** August 8, 2026 (v0.2.0 release)  
**Module split:** See commit [`8d95a58`](https://github.com/Stellar-Basic-DAO/Stellar-Basic-DAO/commit/8d95a58)
