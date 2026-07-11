export const STELLAR_BASIC_DAO_EVENT_SCHEMA_VERSION = 2;

export const STELLAR_BASIC_DAO_EVENT_TOPICS = {
  admin: "TOPIC_ADMIN",
  dispute: "TOPIC_DISPUTE",
  escrow: "TOPIC_ESCROW",
  privacy: "TOPIC_PRIVACY",
  stealth: "TOPIC_STEALTH",
} as const;

export type StellarBasicDaoEventTopic =
  (typeof STELLAR_BASIC_DAO_EVENT_TOPICS)[keyof typeof STELLAR_BASIC_DAO_EVENT_TOPICS];

export interface EventSchemaContract {
  topic: StellarBasicDaoEventTopic;
  eventName: string;
  indexedFields: readonly string[];
  payloadKeys: readonly string[];
  schemaVersion: number;
  compatibleVersions: readonly number[];
}

// payloadKeys are sorted alphabetically.
// "ledger_sequence" ('l') sorts after 'f*' / 'e*' keys and before 'p*' / 'r*' / 's*' keys.
export const STELLAR_BASIC_DAO_EVENT_SCHEMA_CONTRACTS = {
  // ── Escrow events ───────────────────────────────────────────────────────
  EscrowDeposited: {
    topic: STELLAR_BASIC_DAO_EVENT_TOPICS.escrow,
    eventName: "EscrowDeposited",
    indexedFields: ["escrow_id", "owner"],
    payloadKeys: [
      "amount_due",
      "amount_paid",
      "expires_at",
      "ledger_sequence",
      "schema_version",
      "timestamp",
      "token",
    ],
    schemaVersion: STELLAR_BASIC_DAO_EVENT_SCHEMA_VERSION,
    compatibleVersions: [1, STELLAR_BASIC_DAO_EVENT_SCHEMA_VERSION],
  },
  EscrowWithdrawn: {
    topic: STELLAR_BASIC_DAO_EVENT_TOPICS.escrow,
    eventName: "EscrowWithdrawn",
    indexedFields: ["escrow_id", "owner"],
    payloadKeys: ["amount", "fee", "ledger_sequence", "schema_version", "timestamp", "token"],
    schemaVersion: STELLAR_BASIC_DAO_EVENT_SCHEMA_VERSION,
    compatibleVersions: [1, STELLAR_BASIC_DAO_EVENT_SCHEMA_VERSION],
  },
  EscrowRefunded: {
    topic: STELLAR_BASIC_DAO_EVENT_TOPICS.escrow,
    eventName: "EscrowRefunded",
    indexedFields: ["escrow_id", "owner"],
    payloadKeys: ["amount", "ledger_sequence", "schema_version", "timestamp", "token"],
    schemaVersion: STELLAR_BASIC_DAO_EVENT_SCHEMA_VERSION,
    compatibleVersions: [1, STELLAR_BASIC_DAO_EVENT_SCHEMA_VERSION],
  },
  EscrowDisputed: {
    topic: STELLAR_BASIC_DAO_EVENT_TOPICS.escrow,
    eventName: "EscrowDisputed",
    indexedFields: ["escrow_id", "arbiter"],
    payloadKeys: ["ledger_sequence", "schema_version", "timestamp"],
    schemaVersion: STELLAR_BASIC_DAO_EVENT_SCHEMA_VERSION,
    compatibleVersions: [STELLAR_BASIC_DAO_EVENT_SCHEMA_VERSION],
  },
  EscrowFinalized: {
    topic: STELLAR_BASIC_DAO_EVENT_TOPICS.escrow,
    eventName: "EscrowFinalized",
    indexedFields: ["escrow_id", "owner"],
    payloadKeys: ["ledger_sequence", "schema_version", "timestamp", "token", "total_amount"],
    schemaVersion: STELLAR_BASIC_DAO_EVENT_SCHEMA_VERSION,
    compatibleVersions: [STELLAR_BASIC_DAO_EVENT_SCHEMA_VERSION],
  },
  PartialPayment: {
    topic: STELLAR_BASIC_DAO_EVENT_TOPICS.escrow,
    eventName: "PartialPayment",
    indexedFields: ["escrow_id", "payer"],
    payloadKeys: [
      "amount_due",
      "amount_paid",
      "ledger_sequence",
      "payment_amount",
      "schema_version",
      "timestamp",
      "token",
    ],
    schemaVersion: STELLAR_BASIC_DAO_EVENT_SCHEMA_VERSION,
    compatibleVersions: [STELLAR_BASIC_DAO_EVENT_SCHEMA_VERSION],
  },
  // ── Dispute events ──────────────────────────────────────────────────────
  ArbiterVoteCast: {
    topic: STELLAR_BASIC_DAO_EVENT_TOPICS.dispute,
    eventName: "ArbiterVoteCast",
    indexedFields: ["escrow_id", "arbiter"],
    payloadKeys: [
      "ledger_sequence",
      "resolve_for_owner",
      "schema_version",
      "threshold",
      "timestamp",
      "vote_count",
    ],
    schemaVersion: STELLAR_BASIC_DAO_EVENT_SCHEMA_VERSION,
    compatibleVersions: [STELLAR_BASIC_DAO_EVENT_SCHEMA_VERSION],
  },
  DisputeResolved: {
    topic: STELLAR_BASIC_DAO_EVENT_TOPICS.dispute,
    eventName: "DisputeResolved",
    indexedFields: ["escrow_id", "resolved_for_owner"],
    payloadKeys: [
      "amount",
      "ledger_sequence",
      "schema_version",
      "threshold",
      "timestamp",
      "total_votes",
    ],
    schemaVersion: STELLAR_BASIC_DAO_EVENT_SCHEMA_VERSION,
    compatibleVersions: [STELLAR_BASIC_DAO_EVENT_SCHEMA_VERSION],
  },
  DisputeTimeoutSet: {
    topic: STELLAR_BASIC_DAO_EVENT_TOPICS.dispute,
    eventName: "DisputeTimeoutSet",
    indexedFields: ["escrow_id"],
    payloadKeys: ["action", "expires_at", "ledger_sequence", "schema_version", "timestamp"],
    schemaVersion: STELLAR_BASIC_DAO_EVENT_SCHEMA_VERSION,
    compatibleVersions: [STELLAR_BASIC_DAO_EVENT_SCHEMA_VERSION],
  },
  DisputeAutoResolved: {
    topic: STELLAR_BASIC_DAO_EVENT_TOPICS.dispute,
    eventName: "DisputeAutoResolved",
    indexedFields: ["escrow_id", "action"],
    payloadKeys: ["amount", "ledger_sequence", "recipient", "schema_version", "timestamp"],
    schemaVersion: STELLAR_BASIC_DAO_EVENT_SCHEMA_VERSION,
    compatibleVersions: [STELLAR_BASIC_DAO_EVENT_SCHEMA_VERSION],
  },
  // ── Privacy events ──────────────────────────────────────────────────────
  PrivacyToggled: {
    topic: STELLAR_BASIC_DAO_EVENT_TOPICS.privacy,
    eventName: "PrivacyToggled",
    indexedFields: ["owner"],
    payloadKeys: ["enabled", "ledger_sequence", "schema_version", "timestamp"],
    schemaVersion: STELLAR_BASIC_DAO_EVENT_SCHEMA_VERSION,
    compatibleVersions: [1, STELLAR_BASIC_DAO_EVENT_SCHEMA_VERSION],
  },
  // ── Stealth events ──────────────────────────────────────────────────────
  EphemeralKeyRegistered: {
    topic: STELLAR_BASIC_DAO_EVENT_TOPICS.stealth,
    eventName: "EphemeralKeyRegistered",
    indexedFields: ["stealth_address", "eph_pub"],
    payloadKeys: [
      "amount_due",
      "amount_paid",
      "expires_at",
      "ledger_sequence",
      "schema_version",
      "timestamp",
      "token",
    ],
    schemaVersion: STELLAR_BASIC_DAO_EVENT_SCHEMA_VERSION,
    compatibleVersions: [STELLAR_BASIC_DAO_EVENT_SCHEMA_VERSION],
  },
  StealthWithdrawn: {
    topic: STELLAR_BASIC_DAO_EVENT_TOPICS.stealth,
    eventName: "StealthWithdrawn",
    indexedFields: ["stealth_address", "recipient"],
    payloadKeys: ["amount", "ledger_sequence", "schema_version", "timestamp", "token"],
    schemaVersion: STELLAR_BASIC_DAO_EVENT_SCHEMA_VERSION,
    compatibleVersions: [STELLAR_BASIC_DAO_EVENT_SCHEMA_VERSION],
  },
  // ── Admin events ────────────────────────────────────────────────────────
  AdminChanged: {
    topic: STELLAR_BASIC_DAO_EVENT_TOPICS.admin,
    eventName: "AdminChanged",
    indexedFields: ["old_admin", "new_admin"],
    payloadKeys: ["ledger_sequence", "schema_version", "timestamp"],
    schemaVersion: STELLAR_BASIC_DAO_EVENT_SCHEMA_VERSION,
    compatibleVersions: [1, STELLAR_BASIC_DAO_EVENT_SCHEMA_VERSION],
  },
  ContractInitialized: {
    topic: STELLAR_BASIC_DAO_EVENT_TOPICS.admin,
    eventName: "ContractInitialized",
    indexedFields: ["admin"],
    payloadKeys: [
      "contract_version",
      "event_schema_version",
      "ledger_sequence",
      "paused",
      "schema_version",
      "timestamp",
    ],
    schemaVersion: STELLAR_BASIC_DAO_EVENT_SCHEMA_VERSION,
    compatibleVersions: [STELLAR_BASIC_DAO_EVENT_SCHEMA_VERSION],
  },
  ContractMigrated: {
    topic: STELLAR_BASIC_DAO_EVENT_TOPICS.admin,
    eventName: "ContractMigrated",
    indexedFields: ["admin"],
    payloadKeys: ["from_version", "ledger_sequence", "schema_version", "timestamp", "to_version"],
    schemaVersion: STELLAR_BASIC_DAO_EVENT_SCHEMA_VERSION,
    compatibleVersions: [STELLAR_BASIC_DAO_EVENT_SCHEMA_VERSION],
  },
  ContractPaused: {
    topic: STELLAR_BASIC_DAO_EVENT_TOPICS.admin,
    eventName: "ContractPaused",
    indexedFields: ["admin"],
    payloadKeys: ["ledger_sequence", "paused", "schema_version", "timestamp"],
    schemaVersion: STELLAR_BASIC_DAO_EVENT_SCHEMA_VERSION,
    compatibleVersions: [STELLAR_BASIC_DAO_EVENT_SCHEMA_VERSION],
  },
  ContractUpgraded: {
    topic: STELLAR_BASIC_DAO_EVENT_TOPICS.admin,
    eventName: "ContractUpgraded",
    indexedFields: ["new_wasm_hash", "admin"],
    payloadKeys: ["ledger_sequence", "schema_version", "timestamp"],
    schemaVersion: STELLAR_BASIC_DAO_EVENT_SCHEMA_VERSION,
    compatibleVersions: [STELLAR_BASIC_DAO_EVENT_SCHEMA_VERSION],
  },
  DisputeExpiryActionSet: {
    topic: STELLAR_BASIC_DAO_EVENT_TOPICS.admin,
    eventName: "DisputeExpiryActionSet",
    indexedFields: [],
    payloadKeys: ["action", "ledger_sequence", "schema_version", "timestamp"],
    schemaVersion: STELLAR_BASIC_DAO_EVENT_SCHEMA_VERSION,
    compatibleVersions: [STELLAR_BASIC_DAO_EVENT_SCHEMA_VERSION],
  },
  DisputeTimeoutConfigSet: {
    topic: STELLAR_BASIC_DAO_EVENT_TOPICS.admin,
    eventName: "DisputeTimeoutConfigSet",
    indexedFields: [],
    payloadKeys: ["ledger_sequence", "schema_version", "timeout_secs", "timestamp"],
    schemaVersion: STELLAR_BASIC_DAO_EVENT_SCHEMA_VERSION,
    compatibleVersions: [STELLAR_BASIC_DAO_EVENT_SCHEMA_VERSION],
  },
  EmergencyModeActivated: {
    topic: STELLAR_BASIC_DAO_EVENT_TOPICS.admin,
    eventName: "EmergencyModeActivated",
    indexedFields: ["admin"],
    payloadKeys: ["ledger_sequence", "schema_version", "timestamp"],
    schemaVersion: STELLAR_BASIC_DAO_EVENT_SCHEMA_VERSION,
    compatibleVersions: [STELLAR_BASIC_DAO_EVENT_SCHEMA_VERSION],
  },
  FeeCollectorRotated: {
    topic: STELLAR_BASIC_DAO_EVENT_TOPICS.admin,
    eventName: "FeeCollectorRotated",
    indexedFields: ["new_collector"],
    payloadKeys: ["ledger_sequence", "rotation_index", "schema_version", "timestamp"],
    schemaVersion: STELLAR_BASIC_DAO_EVENT_SCHEMA_VERSION,
    compatibleVersions: [STELLAR_BASIC_DAO_EVENT_SCHEMA_VERSION],
  },
  FeeConfigChanged: {
    topic: STELLAR_BASIC_DAO_EVENT_TOPICS.admin,
    eventName: "FeeConfigChanged",
    indexedFields: [],
    payloadKeys: ["fee_bps", "ledger_sequence", "schema_version", "timestamp"],
    schemaVersion: STELLAR_BASIC_DAO_EVENT_SCHEMA_VERSION,
    compatibleVersions: [STELLAR_BASIC_DAO_EVENT_SCHEMA_VERSION],
  },
  HookRegistered: {
    topic: STELLAR_BASIC_DAO_EVENT_TOPICS.admin,
    eventName: "HookRegistered",
    indexedFields: ["hook_contract"],
    payloadKeys: ["ledger_sequence", "schema_version", "timestamp"],
    schemaVersion: STELLAR_BASIC_DAO_EVENT_SCHEMA_VERSION,
    compatibleVersions: [STELLAR_BASIC_DAO_EVENT_SCHEMA_VERSION],
  },
  HookUnregistered: {
    topic: STELLAR_BASIC_DAO_EVENT_TOPICS.admin,
    eventName: "HookUnregistered",
    indexedFields: ["hook_contract"],
    payloadKeys: ["ledger_sequence", "schema_version", "timestamp"],
    schemaVersion: STELLAR_BASIC_DAO_EVENT_SCHEMA_VERSION,
    compatibleVersions: [STELLAR_BASIC_DAO_EVENT_SCHEMA_VERSION],
  },
  PauseFlagsChanged: {
    topic: STELLAR_BASIC_DAO_EVENT_TOPICS.admin,
    eventName: "PauseFlagsChanged",
    indexedFields: ["admin"],
    payloadKeys: ["flags_disabled", "flags_enabled", "ledger_sequence", "schema_version", "timestamp"],
    schemaVersion: STELLAR_BASIC_DAO_EVENT_SCHEMA_VERSION,
    compatibleVersions: [STELLAR_BASIC_DAO_EVENT_SCHEMA_VERSION],
  },
  PerAssetFeeSet: {
    topic: STELLAR_BASIC_DAO_EVENT_TOPICS.admin,
    eventName: "PerAssetFeeSet",
    indexedFields: ["token"],
    payloadKeys: ["arbiter_bps", "fee_bps", "ledger_sequence", "schema_version", "timestamp"],
    schemaVersion: STELLAR_BASIC_DAO_EVENT_SCHEMA_VERSION,
    compatibleVersions: [STELLAR_BASIC_DAO_EVENT_SCHEMA_VERSION],
  },
  PlatformWalletChanged: {
    topic: STELLAR_BASIC_DAO_EVENT_TOPICS.admin,
    eventName: "PlatformWalletChanged",
    indexedFields: ["wallet"],
    payloadKeys: ["ledger_sequence", "schema_version", "timestamp"],
    schemaVersion: STELLAR_BASIC_DAO_EVENT_SCHEMA_VERSION,
    compatibleVersions: [STELLAR_BASIC_DAO_EVENT_SCHEMA_VERSION],
  },
  UpgradeCompleted: {
    topic: STELLAR_BASIC_DAO_EVENT_TOPICS.admin,
    eventName: "UpgradeCompleted",
    indexedFields: ["admin"],
    payloadKeys: ["ledger_sequence", "new_version", "old_version", "schema_version", "timestamp"],
    schemaVersion: STELLAR_BASIC_DAO_EVENT_SCHEMA_VERSION,
    compatibleVersions: [STELLAR_BASIC_DAO_EVENT_SCHEMA_VERSION],
  },
  UpgradeStarted: {
    topic: STELLAR_BASIC_DAO_EVENT_TOPICS.admin,
    eventName: "UpgradeStarted",
    indexedFields: ["admin"],
    payloadKeys: [
      "ledger_sequence",
      "new_version",
      "new_wasm_hash",
      "old_version",
      "schema_version",
      "timestamp",
      "window_end",
      "window_start",
    ],
    schemaVersion: STELLAR_BASIC_DAO_EVENT_SCHEMA_VERSION,
    compatibleVersions: [STELLAR_BASIC_DAO_EVENT_SCHEMA_VERSION],
  },
  UpgradeWindowSet: {
    topic: STELLAR_BASIC_DAO_EVENT_TOPICS.admin,
    eventName: "UpgradeWindowSet",
    indexedFields: ["admin"],
    payloadKeys: ["ledger_sequence", "schema_version", "timestamp", "window_end", "window_start"],
    schemaVersion: STELLAR_BASIC_DAO_EVENT_SCHEMA_VERSION,
    compatibleVersions: [STELLAR_BASIC_DAO_EVENT_SCHEMA_VERSION],
  },
} as const satisfies Record<string, EventSchemaContract>;

export const STELLAR_BASIC_DAO_EVENT_COMPATIBILITY = Object.fromEntries(
  Object.entries(STELLAR_BASIC_DAO_EVENT_SCHEMA_CONTRACTS).map(
    ([eventName, contract]) => [
      eventName,
      {
        currentVersion: contract.schemaVersion,
        compatibleVersions: contract.compatibleVersions,
        canonicalTopic: contract.topic,
      },
    ],
  ),
) as unknown as Record<
  keyof typeof STELLAR_BASIC_DAO_EVENT_SCHEMA_CONTRACTS,
  {
    currentVersion: number;
    compatibleVersions: readonly number[];
    canonicalTopic: StellarBasicDaoEventTopic;
  }
>;
