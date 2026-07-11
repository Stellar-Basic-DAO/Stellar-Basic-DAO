# Required GitHub Secrets for Contract Deployment

The [Contract Deploy workflow](../../.github/workflows/contract-deploy.yml) requires the following GitHub Secrets to be configured in the repository settings (`Settings → Secrets and variables → Actions`).

## Testnet Secrets

| Secret Name | Description | Required |
|-------------|-------------|----------|
| `TESTNET_DEPLOY_KEY` | Stellar account **secret key** (S... format) used to deploy contracts to testnet. This account must be funded with testnet XLM. | Yes |
| `TESTNET_ADMIN_KEY` | Stellar account **public key** (G... format) that will be set as the contract admin during initialization. Can be the same as or different from the deploy key. | No (contract will not be initialized if omitted) |

## Mainnet Secrets

| Secret Name | Description | Required |
|-------------|-------------|----------|
| `MAINNET_DEPLOY_KEY` | Stellar account **secret key** (S... format) used to deploy contracts to mainnet. **This account controls real assets — protect it carefully.** | Yes (for mainnet deploys) |
| `MAINNET_ADMIN_KEY` | Stellar account **public key** (G... format) for contract admin on mainnet. Should be a multi-sig or governance-controlled address. | No (contract will not be initialized if omitted) |

## Network Details

### Testnet
- **RPC URL:** `https://soroban-testnet.stellar.org`
- **Network Passphrase:** `Test SDF Network ; September 2015`
- **Faucet:** Use [Stellar Lab](https://lab.stellar.org/) or the Friendbot to fund the deploy key

### Mainnet
- **RPC URL:** `https://mainnet.stellar.org`
- **Network Passphrase:** `Public Global Stellar Network ; September 2015`
- **Governance:** Mainnet deploys require governance approval before execution

## Setting Up the Secrets

### Step 1: Generate a deploy identity
```bash
stellar keys generate stellar-basic-dao-testnet
stellar keys generate stellar-basic-dao-mainnet
```

### Step 2: Fund the testnet account
```bash
# Get the public key
stellar keys address stellar-basic-dao-testnet

# Fund via Friendbot (replace GB... with your public key)
curl "https://friendbot.stellar.org?addr=GB..."
```

### Step 3: Add secrets to GitHub
1. Go to your repository on GitHub
2. Navigate to **Settings → Secrets and variables → Actions**
3. Click **New repository secret**
4. Add each secret listed above

### Step 4: Export the deploy key secret
```bash
# Get the secret key for the generated identity
stellar keys show stellar-basic-dao-testnet
```

Copy the **S...** secret key into the `TESTNET_DEPLOY_KEY` secret.

## Security Notes

- **Never commit secret keys** to the repository.
- **Never log secret keys** in CI output.
- Use different keys for testnet and mainnet.
- For mainnet, prefer a multi-sig setup where the deploy key has limited privileges.
- Rotate keys periodically and update the GitHub secrets accordingly.
- The deploy workflow uses GitHub's built-in secret masking — secret values are automatically redacted from CI logs.
