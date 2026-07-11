# Mainnet Governance & Deployment Approval

This document defines the governance process required before any mainnet contract deployment or upgrade can proceed.
It complements the [deployment-playbook.md](deployment-playbook.md) and [deployment-checklist.md](deployment-checklist.md).

## 1. Governance Model

The contract uses an **M-of-N multisig governance model** implemented in [`governance.rs`](../contracts/Folder/src/governance.rs).

Key parameters:
- **Signer Set**: A list of N addresses authorized to vote on proposals
- **Threshold**: The minimum number M of approvals required to execute a proposal
- **Proposal Lifecycle**: `create_proposal → approve_proposal → execute_proposal`

All privileged actions (deploy, upgrade, pause, fee config, admin changes) must go through this governance process on mainnet.

## 2. Mainnet Governance Council

Before any mainnet deployment, a governance council must be established:

| Role | Description | Minimum Count |
|------|-------------|---------------|
| Core Dev Team | Protocol developers with deploy access | 2 |
| Community Reps | Independent community members | 2 |
| Security Auditors | External security reviewers | 1 |

**Recommended configuration: 3-of-5 multisig** (or higher, depending on council size).

### Council Member Requirements

- Each member must have a funded Stellar account on mainnet
- Member addresses must be documented in the [environment-registry.toml](environment-registry.toml)
- Members should store their signing keys securely (hardware wallet preferred)
- At least 2 members should be geographically distributed

## 3. Proposal Types

### Deployment Proposal
Used to authorize a new contract deployment on mainnet.

**Parameters:**
- `contract_id` — Expected contract address (from testnet deploy)
- `wasm_hash` — SHA256 hash of the release WASM
- `admin_address` — Contract admin address
- `governance_signer_set` — Initial governance signer addresses
- `governance_threshold` — Initial M-of-N threshold

### Upgrade Proposal
Used to authorize an upgrade of an existing deployed contract.

**Parameters:**
- `target_version` — New contract version number
- `new_wasm_hash` — SHA256 hash of the upgrade WASM
- `upgrade_window_start` — Ledger timestamp when upgrade window opens
- `upgrade_window_end` — Ledger timestamp when upgrade window closes
- `migration_plan` — Description of storage migration (if any)
- `invariant_checks` — List of post-upgrade invariants to verify

### Emergency Proposal
Used for urgent fixes (pause, emergency mode, critical bug fixes).

**Parameters:**
- `action` — The emergency action to take
- `justification` — Explanation of the emergency
- `timeline` — Expected resolution timeline

## 4. Pre-Deployment Checklist

Before a mainnet deployment proposal can be created:

- [ ] Testnet deployment completed and recorded in [environment-registry.toml](environment-registry.toml)
- [ ] All `cargo test` suites pass (including bench, upgrade harness, event schema)
- [ ] `cargo clippy --all-targets -- -D warnings` passes
- [ ] `cargo fmt --all -- --check` passes
- [ ] Deployment checklist ([deployment-checklist.md](deployment-checklist.md)) fully completed
- [ ] WASM hash verified against testnet deployment
- [ ] Smoke tests passed on testnet (health check, metadata, event emission)
- [ ] Governance council members confirmed and signer set documented
- [ ] Emergency pause/rollback path documented
- [ ] Monitoring hooks enabled and verified
- [ ] Upgrade safety gate configured ([UPGRADE_SAFETY_GATE.md](../docs/UPGRADE_SAFETY_GATE.md))

## 5. Approval Flow

### Step 1: Create Proposal

```bash
stellar contract invoke \
  --network testnet \
  --id <TESTNET_CONTRACT_ID> \
  --source <PROPOSER_SECRET_KEY> \
  -- \
  create_proposal \
  --proposer <PROPOSER_ADDRESS> \
  --action '{"upgrade_contract": {"new_version": 2, "new_wasm_hash": "0x...", "migration_plan": "v1_to_v2"}}' \
  --nonce 1 \
  --valid_until <TIMESTAMP_PLUS_7_DAYS>
```

The proposal should be created on testnet first to verify the flow, then the actual mainnet proposal is created on mainnet.

### Step 2: Council Voting

Each governance council member must approve the proposal:

```bash
stellar contract invoke \
  --network mainnet \
  --id <MAINNET_CONTRACT_ID> \
  --source <MEMBER_SECRET_KEY> \
  -- \
  approve_proposal \
  --caller <MEMBER_ADDRESS> \
  --proposal_id <PROPOSAL_ID>
```

### Step 3: Execute Proposal

Once the threshold is reached, any signer can execute:

```bash
stellar contract invoke \
  --network mainnet \
  --id <MAINNET_CONTRACT_ID> \
  --source <ANY_SIGNER_KEY> \
  -- \
  execute_proposal \
  --proposal_id <PROPOSAL_ID>
```

### Step 4: Post-Execution Verification

- [ ] Call `get_deployment_metadata()` and verify contract version
- [ ] Run `health_check()` and confirm healthy
- [ ] Verify event schema matches [events-schema.md](../docs/events-schema.md)
- [ ] Update [environment-registry.toml](environment-registry.toml) with new deployment data
- [ ] Notify governance council of completion

## 6. Key Management

### Mainnet Deploy Key
- **Purpose**: Only used for the `stellar contract deploy` command
- **Security**: This key can be a hot key with limited permissions (just deploy)
- **Rotation**: Rotate after each successful deployment

### Mainnet Admin Key
- **Purpose**: Used for contract initialization and future admin actions
- **Security**: Should be a cold wallet or multi-sig address
- **Rotation**: Requires a governance proposal to change

### Governance Signer Keys
- **Purpose**: Used for approving proposals
- **Security**: Hardware wallets or secure custody solutions
- **Rotation**: Requires an `UpdateSignerSet` governance proposal

## 7. Timelock & Delays

For non-emergency upgrades, a **timelock** is recommended:

1. Proposal created and published for review: **Day 0**
2. Council voting period: **Day 0–7**
3. Execution window: **Day 7–14**
4. Contract deployment: **After execution, within upgrade window**

Emergency proposals can skip the timelock but require:
- At least 2/3 of council members to approve
- Public disclosure within 24 hours
- Retrospective review within 7 days

## 8. Registry Updates

After any mainnet deployment:

1. Create a PR updating [environment-registry.toml](environment-registry.toml) with:
   - New `contract_id`
   - Updated `wasm_hash`
   - Updated `deployed_at` timestamp
   - Deployment notes
2. The PR must reference the governance proposal ID
3. At least one non-deployer council member must approve the PR

## 9. References

- [Deployment Playbook](deployment-playbook.md) — Full deployment process
- [Deployment Checklist](deployment-checklist.md) — Pre-deployment verification
- [Secret Management](SECRETS.md) — GitHub secrets for CI/CD
- [Environment Registry](environment-registry.toml) — Deployment state
- [Upgrade Safety Gate](../docs/UPGRADE_SAFETY_GATE.md) — Upgrade lifecycle
- [Events Schema](../docs/events-schema.md) — Event format documentation
- [Governance Module](../contracts/Folder/src/governance.rs) — On-chain governance implementation
- [Smart Contracts Overview](../../docs/SMART-CONTRACTS.md) — Architecture overview
