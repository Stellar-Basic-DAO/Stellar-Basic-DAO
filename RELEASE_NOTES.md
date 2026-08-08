# Release Notes

## v0.2.0 — Modular Contract Architecture + Testnet Deployment (2026-08-08)

### Breaking Changes
- **Contract modularization**: The monolithic `StellarBasicDAOContract` (164KB) has been split into 4 independent sub-contracts plus a shared crate to meet Soroban deployment limits.

### New Sub-contracts
| Contract | Size | Contract ID (Testnet) |
|:---|---|:---|
| `stellar-dao-escrow` | 84KB | `CARWR7ZW426KQSPJDWVD756AMKFFGNWFEHE77WYK3ESDTW6NDBY27PMF` |
| `stellar-dao-governance` | 85KB | `CDR27RYZ7LWFUIO5IJMLGAW6AQ7H6P2SB7JYRRIHJ5JF24E44RLLVAPF` |
| `stellar-dao-fee` | 47KB | `CBYSO64OUMCCTSTP4F3P5P6ZCSG5BJKUN6TNOWWIP6YKF2XAQ5Z5LBNU` |
| `stellar-dao-stealth` | 55KB | `CBQQ7MXKTEZOV2CIZBFRAYDL5YP6XIXRYJQC3CU7X5IEX3SQGARKFWBD` |

### Added
- Shared crate (`stellar-dao-shared`) for cross-contract types and helpers
- `build.rs` for governance build manifest (GIT_HASH, BUILD_TIMESTAMP, SOURCE_HASH)
- CI/CD matrix build for all 4 sub-contracts
- `wasm-opt` optimization pipeline for Protocol 27 compatibility
- `deploy-testnet.sh` automated deployment script
- `environment-registry.toml` for per-contract deployment tracking

### Changed
- Escrow: added `arbiters`, `arbiter_threshold`, `schema_version` fields to `EscrowEntry`
- Governance: removed cross-contract deps (fee_router, hook); stubbed `rotate_fee_collector`
- ProposalAction enum: converted to tuple variants for Soroban SDK `#[contracttype]` compatibility
- Admin guard functions: replaced `crate::hook::assert_not_reentrant` with doc comments
- Updated README with modular architecture diagram and deployment status table

### Fixed
- 13 governance compilation errors (import paths, build constants, cross-contract deps)
- 2 escrow compilation errors (import resolution, missing EscrowEntry fields)
- `pub(crate)` visibility changed to `pub` for cross-contract access in shared crate

---

## v0.1.0 — Monolithic Soroban Contract (2025)

### Initial Release
- Single monolithic `StellarBasicDAOContract` (Soroban SDK v23)
- **Escrow**: deposit, withdraw, refund, partial payment, deposit_with_commitment, deposit_partial, deposit_with_arbiters
- **Dispute**: dispute, vote_for_dispute, resolve_dispute, resolve_dispute_multi_sig, auto-resolve on expiry
- **Privacy**: set_privacy, get_privacy, privacy-aware escrow views
- **Fee Router**: per-asset fee configuration, oracle fee integration, collector rotation
- **Governance**: M-of-N multisig proposals, signer management, admin roles, upgrade gating
- **Stealth**: ephemeral key registration, stealth withdraw
- **Hooks**: event hook registration and invocation
- **Metadata**: deployment metadata, contract health, feature flags, schema compatibility
- 250+ contract tests across 17 test files
- Fuzz tests, benchmark tests, upgrade safety tests
- 10 documented financial invariants (INV-01 through INV-10)
- Structured error codes (100-699 range)
- On-chain event schema v2 with stable event_type_id values
