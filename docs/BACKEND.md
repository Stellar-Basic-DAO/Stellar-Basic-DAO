# Backend Architecture & API Guide

> **NestJS-based backend API powering RustAcademy — integrating Stellar, Soroban smart contracts, Supabase, and AI services.**

---

## Overview

The backend is a NestJS 10 application located at `app/backend/`. It serves as the trusted off-chain layer that:

1. Exposes REST API endpoints consumed by the web and mobile clients
2. Integrates with the Stellar network via `@stellar/stellar-sdk` v14.5.0
3. Reads and writes Soroban contract state via Soroban RPC
4. Ingests Soroban events via Horizon subscription
5. Manages user data, course progress, and payment state in Supabase (PostgreSQL)
6. Runs background jobs for recurring payments, reconciliation, and notifications

---

## Module Overview

The backend is organized into **35+ feature modules**:

| Module | Purpose |
|---|---|
| `auth` | JWT-based authentication, API key validation |
| `payments` | Payment lifecycle management |
| `links` | Payment link generation and resolution |
| `contracts` | Soroban contract client wrappers |
| `stellar` | Stellar SDK utilities (account, transaction builders) |
| `soroban-tooling` | Soroban RPC helpers, contract invocation utils |
| `ingestion` | Horizon event stream ingestion + Soroban event parsing |
| `reconciliation` | On-chain vs off-chain state reconciliation |
| `refunds` | Refund processing (expired escrows) |
| `job-queue` | Custom background job system (JobRegistry, JobExecutor) |
| `notifications` | Push, email, and Telegram notification dispatch |
| `analytics` | Usage metrics and platform analytics |
| `audit` | Immutable audit log for all privileged actions |
| `usernames` | Username registration and discovery |
| `asset-metadata` | SAC token metadata (decimals, issuer, symbol) |
| `marketplace` | Course and tutor marketplace |
| `privacy` | Off-chain privacy profile management |
| `feature-flags` | Runtime feature flag evaluation |
| `environment-parity` | Staging ↔ production parity checks |
| `metrics` | Prometheus endpoint (`/metrics`) |
| `health` | Health check endpoint (`/health`) |
| `exports` | Data export APIs |
| `scam-alerts` | Known scam address blocklist |
| `crash-reporting` | Sentry integration |
| `chat` | Real-time chat API |

---

## Environment Variables

Copy `app/backend/.env.example` to `app/backend/.env` and populate:

### Required

```env
# Server
PORT=4000
NODE_ENV=development

# Stellar
NETWORK=testnet                              # testnet | mainnet
STELLAR_NETWORK=testnet
STELLAR_SECRET_KEY=S...                      # Backend operational key

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJ...

# CORS
CORS_ALLOWED_ORIGINS=https://rustacademy.to,https://app.rustacademy.to
CORS_VERCEL_PROJECT=rustacademy-frontend
```

### Optional

```env
# Sentry (error monitoring)
SENTRY_DSN=https://...@sentry.io/...
SENTRY_ENVIRONMENT=production
SENTRY_RELEASE=rustacademy-backend@0.1.0

# Metrics
METRICS_ENDPOINT_PROTECTED=true
METRICS_ENDPOINT_TOKEN=your-secret-token

# Recurring Payments
RECURRING_PAYMENT_MAX_RETRY=3
RECURRING_PAYMENT_RETRY_BACKOFF_MS=60000

# Feature Flags
FEATURES_RECONCILIATION_ENABLED=true
FEATURES_NOTIFICATIONS_ENABLED=true
FEATURES_DEVELOPER_ROUTES_ENABLED=false      # MUST be false in production

# Staging Parity (staging only)
ENV_PARITY_CHECK_ENABLED=false
SHADOW_TRAFFIC_ENABLED=false
STAGING_SEED_DATA_ENABLED=false
```

---

## Running the Backend

```bash
# Development (hot-reload)
pnpm --filter backend dev

# Build for production
pnpm --filter backend build

# Start production server
pnpm --filter backend start

# Run all tests
pnpm --filter backend test

# Unit tests only
pnpm --filter backend test:unit

# Integration tests
pnpm --filter backend test:int

# Fuzz tests (property-based)
pnpm --filter backend test:fuzz

# Smoke tests
pnpm --filter backend test:smoke
```

---

## Soroban Integration

The backend interacts with the Soroban contract through the `soroban-tooling` and `contracts` modules.

### Contract Client

The `contracts` module wraps each Soroban entry point in a typed TypeScript client:

```typescript
// Example: create an escrow deposit
const commitment = await contractClient.deposit({
  token: NATIVE_XLM_ADDRESS,
  amount: BigInt(10_000_000), // 1 XLM in stroops
  owner: userAddress,
  salt: generateSalt(),
  timeoutSecs: 3600n,
  arbiter: null,
});
```

### Event Ingestion

The `ingestion` module subscribes to Soroban events via Horizon's event stream and processes them in real-time:

```
Horizon Event Stream
      │
      ▼
 Ingestion Module
      │
      ├─► Parse EscrowDeposited (event_type_id=1)
      │         → Create payment record in Supabase
      │
      ├─► Parse EscrowWithdrawn (event_type_id=2)
      │         → Mark payment as completed
      │
      └─► Parse DisputeResolved (event_type_id=11)
                → Update dispute state
```

Events are indexed by `event_type_id` (not event name) for forward-compatible schema routing.

---

## Job Queue System

The backend includes a custom job queue for background processing:

| Component | Role |
|---|---|
| `JobRegistry` | Registers job handlers by type |
| `JobRepository` | Persists and queries job state (Supabase) |
| `JobExecutor` | Pulls and executes due jobs |
| `JobScheduler` | Schedules recurring jobs |

**Job types include:**
- `process_recurring_payment` — Execute scheduled recurring payments
- `send_expiry_notification` — Notify users before escrow expires
- `reconcile_horizon_events` — Catch up missed Horizon events
- `cleanup_expired_escrows` — Trigger `refund()` on expired escrows

---

## API Documentation

The backend exposes a full OpenAPI 3.0 specification at:
- `GET /api-docs` (Swagger UI, development only)
- `app/backend/docs/openapi.yaml` (static file)

Key endpoints:

```
POST   /api/v1/links              Create a payment link
GET    /api/v1/links/:id          Resolve a payment link
POST   /api/v1/payments           Create a payment
GET    /api/v1/payments/:id       Get payment status
POST   /api/v1/usernames          Register a username
GET    /api/v1/usernames/:name    Look up a username
GET    /api/v1/transactions       List transactions for an account
GET    /api/v1/analytics          Platform analytics
GET    /health                    Health check (unauthenticated)
GET    /metrics                   Prometheus metrics (auth required in production)
```

---

## Security Architecture

| Control | Implementation |
|---|---|
| **Authentication** | JWT bearer tokens + API key validation |
| **Rate limiting** | `@nestjs/throttler` (per-route limits) |
| **Input validation** | `class-validator` DTOs on all endpoints |
| **CORS** | Allowlist + Vercel preview URL pattern |
| **Security headers** | `helmet` middleware |
| **Error monitoring** | Sentry with PII scrubbing |
| **Secrets management** | Environment variables only (never hardcoded) |
| **Audit log** | Immutable `audit` module records all privileged actions |

---

## Observability

### Metrics (Prometheus)
Exposed at `/metrics` (protected in production). Tracks request latency, job queue depth, Soroban RPC latency, and custom business metrics.

### Logging (Winston)
Structured JSON logs in production. Log levels: `error`, `warn`, `info`, `debug`.

### Error Tracking (Sentry)
Automatic error capture with stack traces, release tracking, and performance profiling.

### Health Check
`GET /health` returns:
```json
{
  "status": "ok",
  "stellar": "connected",
  "supabase": "connected",
  "version": "0.1.0"
}
```
