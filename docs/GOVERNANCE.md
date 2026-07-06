# On-Chain DAO Governance

> **All privileged contract actions in RustAcademy are controlled by a threshold-based M-of-N multisig governance system deployed on Stellar via Soroban.**

---

## Why On-Chain Governance?

A single admin key controlling all protocol actions is a critical centralization risk. The RustAcademy governance module replaces single-admin control with a **proposal → approval → execution** flow that requires `M` of `N` designated signers to agree before any privileged action can take effect.

This provides:
- **Censorship resistance** — No single party can unilaterally pause, upgrade, or drain the protocol
- **Auditability** — Every governance action is recorded on-chain with full event history
- **Flexibility** — The signer set and threshold can be updated through a governance proposal itself

---

## Governance Model

### Signer Set

A set of up to **10 Stellar addresses** constitutes the governance council. Any member can create, approve, or cancel proposals. The signer set is stored in persistent on-chain storage.

### Threshold

An integer `M` where `1 ≤ M ≤ |Signer_Set|`. A proposal becomes executable once it has received `M` distinct approvals.

### Proposal Lifecycle

```
create_proposal()
      │
      ▼ (ProposalCreated event)
   Pending ──────────────────── cancel_proposal()
      │                               │
      │ approve_proposal() × M        ▼
      │                          Cancelled
      ▼ (ProposalApproved event × M)
  Executable
      │
      │ execute_proposal()
      ▼ (ProposalExecuted event)
   Executed
```

- A proposal in `Pending` or `Executable` state can be cancelled by any signer.
- Proposals expire after a configurable window (max **30 days**).
- Expired proposals cannot be approved or executed.

---

## Proposal Actions

The following privileged actions are gated behind governance proposals:

| Action | ProposalAction Variant | Description |
|---|---|---|
| Pause / Unpause | `SetPaused` | Toggle the global contract pause |
| Granular Pause | `SetPauseFlags` | Pause specific operations (deposit, withdrawal, etc.) |
| Contract Upgrade | `UpgradeContract` | Swap the WASM implementation |
| Fee Config | `SetFeeConfig` | Update global fee basis points |
| Per-Asset Fee | `SetPerAssetFee` | Override fee for a specific token |
| Platform Wallet | `SetPlatformWallet` | Change the platform payout address |
| Admin Transfer | `SetAdmin` | Transfer admin role to a new address |
| Grant Role | `GrantRole` | Grant Admin/Operator/Arbiter role |
| Revoke Role | `RevokeRole` | Revoke a role from an address |
| Update Signer Set | `UpdateSignerSet` | Replace the governance council + threshold |

---

## API Reference

### `create_proposal(action, nonce, valid_until) → BytesN<32>`

Creates a governance proposal. The `proposal_id` is derived deterministically:
```
proposal_id = SHA256(action_tag || encoded_params || proposer || nonce || valid_until)
```

The proposer's address is automatically counted as the first approval.

**Returns:** 32-byte `proposal_id`.

**Requirements:**
- Caller must be a member of the signer set.
- `valid_until` must be in the future and at most 30 days away.
- `nonce` must be unique per signer (replay protection via `NonceAlreadyUsed`).

---

### `approve_proposal(proposal_id) → ()`

Records the caller's approval for an existing proposal. When the approval count reaches the threshold, the proposal transitions to `Executable`.

**Requirements:**
- Caller must be a signer.
- Proposal must be `Pending`.
- Proposal must not be expired.
- Caller must not have already approved.

---

### `execute_proposal(proposal_id) → ()`

Executes a proposal that has reached the threshold. Any caller can trigger execution — no auth required.

**Requirements:**
- Proposal must be `Pending` or `Executable`.
- Approval count ≥ threshold.
- Proposal must not be expired.

The action is applied **atomically** — if it fails, no state is changed.

---

### `cancel_proposal(proposal_id) → ()`

Permanently invalidates a `Pending` proposal.

**Requirements:**
- Caller must be a signer.
- Proposal must be `Pending`.

---

### Read-Only Queries

| Function | Returns |
|---|---|
| `get_signer_set()` | `Vec<Address>` — current signer set |
| `get_threshold()` | `u32` — current approval threshold |
| `get_proposal(proposal_id)` | `Option<Proposal>` — full proposal struct |
| `is_signer(address)` | `bool` |

---

## On-Chain Events

All governance lifecycle transitions emit structured events under the `TOPIC_GOVERNANCE` topic namespace.

| Event | Trigger | Key Data |
|---|---|---|
| `ProposalCreated` | `create_proposal()` succeeds | `proposal_id`, `action_tag`, `proposer`, `expires_at` |
| `ProposalApproved` | `approve_proposal()` succeeds | `proposal_id`, `approver`, `approval_count`, `threshold` |
| `ProposalExecuted` | `execute_proposal()` succeeds | `proposal_id`, `action_tag`, `approval_count` |
| `ProposalCancelled` | `cancel_proposal()` succeeds | `proposal_id`, `cancelled_by` |
| `SignerSetUpdated` | `UpdateSignerSet` action executes | `new_threshold`, `signer_count` |

Every event payload includes `schema_version: 1` and `timestamp`.

---

## Error Codes

| Code | Name | Description |
|---|---|---|
| 500 | `NonceAlreadyUsed` | Replay protection: nonce consumed |
| 501 | `SignatureExpired` | `valid_until` has passed |
| 502 | `InvalidThreshold` | Threshold is 0 or exceeds signer count |
| 503 | `InvalidSignerSet` | Empty, > 10, or contains zero addresses |
| 504 | `DuplicateSigner` | Signer set contains duplicate addresses |
| 505 | `NotASigner` | Caller is not in the signer set |
| 506 | `ProposalAlreadyExists` | `proposal_id` already in storage |
| 507 | `ProposalNotFound` | No proposal for this `proposal_id` |
| 508 | `InvalidProposalState` | Proposal is not in the expected state |
| 509 | `AlreadyApproved` | Caller already approved this proposal |
| 510 | `InsufficientApprovals` | Not enough approvals to execute |
| 511 | `ExpiryTooFar` | `valid_until` more than 30 days away |

---

## Storage & TTL Policy

| Data | TTL |
|---|---|
| Pending proposals | At least 30 days |
| Executed / Cancelled proposals | 7 days (for indexer catchup) |
| Signer set & threshold | 6 months (auto-renewed) |
| Consumed nonces | 6 months |

---

## Migration from Single-Admin

During the migration period, the existing admin address is seeded as the sole signer with `threshold = 1`. This preserves backward compatibility while allowing teams to progressively add additional signers and increase the threshold.

**Recommended production setup:**
- `N = 5` signers (key officers of the DAO)
- `M = 3` threshold (3-of-5)
- Admin address is a Stellar multisig account (2-of-3) held by key officers
