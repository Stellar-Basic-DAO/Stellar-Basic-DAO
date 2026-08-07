import {
  Keypair,
  TransactionBuilder,
  Operation,
  Networks,
  Asset,
  BASE_FEE,
  Account,
} from 'stellar-sdk';
import type { PathPreviewRow } from './link-metadata';

/**
 * Verified asset issuer whitelist for the Stellar Basic DAO platform.
 * Maps asset codes to their canonical issuer accounts on Stellar Testnet.
 *
 * In production, this should be fetched from the backend's verified-assets endpoint
 * to ensure automatic updates when new assets are added.
 */
const VERIFIED_ISSUERS: Record<string, string> = {
  USDC: 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5',
  EURC: 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5',
  // Add additional verified assets here as they are onboarded.
};

/**
 * Resolve the canonical issuer address for a given asset code.
 * Falls back to the backend verified-assets constant for unknown assets.
 *
 * @param assetCode - The asset code (e.g., 'USDC', 'EURC')
 * @returns The Stellar account ID of the asset issuer
 * @throws Error if the asset code is not recognized
 */
function resolveIssuer(assetCode: string): string {
  const issuer = VERIFIED_ISSUERS[assetCode];
  if (!issuer) {
    throw new Error(
      `Unknown asset code: ${assetCode}. ` +
      'Add the issuer to the verified assets whitelist or use the backend asset resolver.',
    );
  }
  return issuer;
}

export interface PathPaymentOptions {
  sourceAsset: string;
  sourceAmount: string;
  destinationAsset: string;
  destinationAmount: string;
  destinationAccount: string;
  sourceAccountSequence: number;
  memo?: string;
  memoType?: string;
  network?: 'public' | 'testnet';
}

export interface PathPaymentRoute {
  path: string[];
}

/**
 * Builds a PathPaymentStrictReceive operation.
 * This operation allows paying with any asset and having the amount received be exact.
 * Used for in-app transaction building (when user has connected passkey/wallet).
 */
export function buildPathPaymentOperation(
  options: PathPaymentOptions,
): ReturnType<typeof Operation.pathPaymentStrictReceive> {
  const {
    sourceAsset,
    sourceAmount,
    destinationAsset,
    destinationAmount,
    destinationAccount,
  } = options;

  // Create Asset objects for source and destination
  const srcAsset = sourceAsset === 'XLM'
    ? Asset.native()
    : new Asset(sourceAsset, resolveIssuer(sourceAsset));

  const dstAsset = destinationAsset === 'XLM'
    ? Asset.native()
    : new Asset(destinationAsset, resolveIssuer(destinationAsset))

  return Operation.pathPaymentStrictReceive({
    destination: destinationAccount,
    destAmount: destinationAmount,
    destAsset: dstAsset,
    sendMax: sourceAmount,
    sendAsset: srcAsset,
    path: [], // Path is determined by Stellar network at transaction submission time
  });
}

/**
 * Builds a full path payment transaction for submitting directly to the network.
 * This requires the user's secret key and is NOT currently used in the mobile app
 * (which delegates to external wallets). Provided for future in-app signing support.
 *
 * @throws Error if transaction building fails
 */
export function buildPathPaymentTransaction(
  secretKey: string,
  userAccount: {
    accountId: string;
    sequenceNumber: number;
  },
  options: PathPaymentOptions,
): string {
  const keypair = Keypair.fromSecret(secretKey);

  if (keypair.publicKey() !== userAccount.accountId) {
    throw new Error('Secret key does not match user account');
  }

  const networkPassphrase =
    options.network === 'public' ? Networks.PUBLIC : Networks.TESTNET;

  const transaction = new TransactionBuilder(
    new Account(userAccount.accountId, String(userAccount.sequenceNumber)),
    {
      fee: String(BASE_FEE),
      networkPassphrase,
    },
  )
    .addOperation(buildPathPaymentOperation(options))
    .setTimeout(300)
    .build();

  transaction.sign(keypair);
  return transaction.toEnvelope().toXDR('base64');
}

/**
 * Formats a swap path display string for UI.
 * Example: "USDC → XLM → USD"
 */
export function formatSwapPathDisplay(path: string[]): string {
  if (path.length === 0) {
    return 'Direct';
  }
  return path.join(' → ');
}

/**
 * Calculates the effective exchange rate from a path payment.
 */
export function calculateExchangeRate(
  sourceAmount: string,
  destinationAmount: string,
): number {
  const src = parseFloat(sourceAmount);
  const dst = parseFloat(destinationAmount);
  return dst / src;
}

/**
 * Calculates estimated slippage (spread) from a path payment.
 * Slippage occurs when intermediary hops convert between assets.
 */
export function calculateSlippage(
  sourceAmount: string,
  destinationAmount: string,
  hopCount: number,
): number {
  if (hopCount === 0) {
    return 0; // No slippage on direct payments
  }

  const src = parseFloat(sourceAmount);
  const dst = parseFloat(destinationAmount);
  const rate = dst / src;

  // Estimate base slippage: 0.1% per hop (typical Stellar spread)
  const estimatedBaseSlippage = hopCount * 0.001;

  return Math.min(estimatedBaseSlippage, 0.05); // Cap at 5%
}
