# Core Financial Invariants

> **The Stellar Basic DAO Soroban contract (`StellarBasicDAOContract`) must preserve these invariants under every code path. Any change that could violate one of them MUST be reviewed against this document.**

This document is the canonical specification of the 10 financial invariants the protocol enforces. Every Soroban entry point, every off-chain reconciliation, and every test failure referencing "invariant" should be traceable to a specific `INV-NN` entry below.

---

## Core Financial Invariants

### INV-01: Conservation of Value

The sum of all balances (escrow + merchant + customer + fees) **MUST** equal the total value deposited into the system. No value is created or destroyed outside of explicit protocol actions.

### INV-02: No Unauthorized Withdrawals

Only the designated recipient (merchant on fulfill, customer on refund, arbiter on dispute resolution) may claim payment funds. No third party can withdraw funds from an escrow they are not a party to.

### INV-03: No Overpayment

The total amount released from a payment **MUST NOT** exceed the original deposited amount plus any permitted fee adjustments. Each payment releases at most its principal.

### INV-04: No Double-Settlement

A payment can transition to a terminal state (**Fulfilled**, **Refunded**, or **DisputeResolved**) exactly once. No payment can be fulfilled **AND** refunded, or settled twice.

---

## State Machine Invariants

### INV-05: Valid State Transitions Only

The payment state machine only permits:

- `Created → Funded → Fulfilled`
- `Created → Funded → Disputed → DisputeResolved`
- `Created → Funded → Refunded` *(after expiry)*
- `Created → Expired` *(if never funded)*

No backward or cross-branch transitions are valid.

### INV-06: Expiry Monotonicity

A payment whose expiry timestamp has passed **cannot** be fulfilled. It can only be refunded or disputed (if already in dispute).

### INV-07: Nonce Uniqueness

No two payments can share the same `(creator, nonce)` pair. Replay of a previously consumed nonce **MUST** be rejected.

### INV-08: Authorization Consistency

The actor performing a transition **MUST** be authorized:

- Only the creator can `fund`
- Only the merchant can `fulfill`
- Only the customer can request a `refund`
- Only the designated arbiter can `resolve_dispute`

---

## Edge-Case Invariants

### INV-09: Zero-Amount Payment

Zero-amount payments follow the same state machine but **MUST NOT** result in any token transfers.

### INV-10: Fee Ceiling

Protocol fees collected per payment **MUST NOT** exceed the configured maximum fee percentage of the payment amount.

---

## Cross-References

| Topic | Where it lives |
|---|---|
| Escrow state machine diagram | [`docs/SMART-CONTRACTS.md`](SMART-CONTRACTS.md) |
| Governance actions & error codes | [`docs/GOVERNANCE.md`](GOVERNANCE.md) |
| On-chain event schema (v2) | [`docs/SMART-CONTRACTS.md#event-schema`](SMART-CONTRACTS.md) |
| MVP scope decisions affecting these invariants | [`docs/MVP-CONTRACT-SCOPE.md`](MVP-CONTRACT-SCOPE.md) |

If you find a code path in the contract or backend that could plausibly violate any of `INV-01` through `INV-10`, open a security issue labeled `invariant` and tag the matching `INV-NN` section above.
