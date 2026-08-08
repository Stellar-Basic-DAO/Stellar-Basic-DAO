# Required GitHub Secrets for Contract Deployment

The [Contract Deploy workflow](../../.github/workflows/contract-deploy.yml) requires the following GitHub Secrets to be configured in the repository settings (`Settings → Secrets and variables → Actions`).

## Architecture

The deploy workflow builds and deploys **4 sub-contracts** independently:

| Sub-contract | Description |
|:---|:---|
| `stellar-dao-escrow` | Core escrow: deposit, withdraw, refund, dispute, privacy |
| `stellar-dao-governance` | Governance: multisig proposals, admin roles, upgrade gating |
| `stellar-dao-fee` | Fee router: fee config, payout routing, oracle integration |
| `stellar-dao-stealth` | Stealth: privacy-preserving stealth address deposits |

All 4 share the same deploy keys — one deployer key funds all deployments.

## Testnet Secrets

| Secret Name | Description | Required |
|-------------|-------------|----------|
| `TESTNET_DEPLOY_KEY` | Stellar account **secret key** (S... format) used to deploy all sub-contracts to testnet. This account must be funded with testnet XLM for each sub-contract deployment (~10 XLM per contract). | Yes |
| `TESTNET_ADMIN_KEY` | Stellar account **public key** (G... format) set as the governance contract admin during initialization. Only used for the governance sub-contract. | No |

## Mainnet Secrets

| Secret Name | Description | Required |
|-------------|-------------|----------|
| `MAINNET_DEPLOY_KEY` | Stellar account **secret key** (S... format) for mainnet deploys. **Protect carefully — this controls real assets.** | Yes (for mainnet) |
| `MAINNET_ADMIN_KEY` | Stellar account **public key** (G... format) for governance contract admin on mainnet. Should be a multi-sig/governance address. | No |

## Network Details

### Testnet
- **RPC URL:** `https://soroban-testnet.stellar.org`
- **Network Passphrase:** `Test SDF Network ; September 2015`
- **Protocol:** 27
- **WASM limit:** ~64KB per contract
- **Faucet:** [Stellar Lab](https://lab.stellar.org/) or Friendbot

### Mainnet
- **RPC URL:** `https://mainnet.stellar.org`
- **Network Passphrase:** `Public Global Stellar Network ; September 2015`
- **Governance:** Mainnet deploys require governance approval

## Setting Up the Secrets

### Step 1: Generate deploy identity
```bash
stellar keys generate stellar-basic-dao-testnet
stellar keys generate stellar-basic-dao-mainnet
```

### Step 2: Fund the testnet account
```bash
stellar keys address stellar-basic-dao-testnet
# Fund via Friendbot
curl "https://friendbot.stellar.org?addr=GB..."
```

### Step 3: Add secrets to GitHub
1. Go to your repository on GitHub
2. Navigate to **Settings → Secrets and variables → Actions**
3. Click **New repository secret**
4. Add each secret listed above

### Step 4: Export the secret key
```bash
stellar keys show stellar-basic-dao-testnet
# Copy the S... key into TESTNET_DEPLOY_KEY secret
```

## Running the Workflow

1. Go to **Actions → Contract Deploy**
2. Click **Run workflow**
3. Select `network`: `testnet` (default) or `mainnet`
4. Set `contracts`: `all` (default) or comma-separated list like `stellar-dao-stealth,stellar-dao-fee`
5. Set `dry_run`: `false` to actually deploy
6. Click **Run workflow**

## Verification

After deployment, verify on Stellar Expert:
```
https://stellar.expert/explorer/testnet/contract/<CONTRACT_ID>
```

And update `environment-registry.toml` with the deployed contract IDs.

## Security Notes

- **Never commit secret keys** to the repository
- **Never log secret keys** in CI output
- Use different keys for testnet and mainnet
- Fund the testnet deployer with sufficient XLM (~40 XLM for all 4 contracts)
- Rotate keys periodically and update secrets
