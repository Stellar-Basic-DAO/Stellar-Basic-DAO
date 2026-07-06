# System Architecture

## High-Level Overview

RustAcademy is a full-stack decentralized application organized as a monorepo with five distinct application layers.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                                    │
│                                                                          │
│  ┌──────────────────────────┐    ┌────────────────────────────────┐     │
│  │  Next.js 15 Web App      │    │  React Native / Expo Mobile     │     │
│  │  (app/frontend)          │    │  (app/mobile)                   │     │
│  │  • SSR + RSC             │    │  • iOS + Android                │     │
│  │  • Freighter integration │    │  • expo-secure-store            │     │
│  │  • i18n (en, ...)        │    │  • Biometric auth               │     │
│  └──────────────┬───────────┘    └───────────────┬────────────────┘     │
│                 │ REST + WebSocket                │                      │
└─────────────────┼───────────────────────────────-┼──────────────────────┘
                  │                                 │
┌─────────────────▼─────────────────────────────────▼──────────────────────┐
│                      BACKEND LAYER (app/backend)                          │
│                                                                            │
│  NestJS 10 · TypeScript · @stellar/stellar-sdk 14.5                        │
│                                                                            │
│  ┌──────────┐ ┌──────────┐ ┌──────────────┐ ┌────────────────────────┐   │
│  │   Auth   │ │ Payments │ │    Links     │ │  Soroban Tooling       │   │
│  │  + JWT   │ │  + Jobs  │ │  (payment   │ │  (RPC calls, events,   │   │
│  └──────────┘ └──────────┘ │   links)    │ │   contract clients)    │   │
│  ┌──────────┐ ┌──────────┐ └──────────────┘ └────────────────────────┘   │
│  │Ingestion │ │  Recon-  │ ┌──────────────┐ ┌────────────────────────┐   │
│  │ Horizon  │ │ciliation │ │  Analytics   │ │    Job Queue           │   │
│  │  events  │ └──────────┘ └──────────────┘ │  (background tasks)   │   │
│  └──────────┘                               └────────────────────────┘   │
│                                                                            │
│  Supabase (PostgreSQL) ← Supabase Client → Database                       │
│  Winston (logging)  ·  Sentry (errors)  ·  Prometheus (metrics)           │
└──────────────────────────────┬─────────────────────────────────────────---┘
                               │ @stellar/stellar-sdk + Soroban RPC
┌──────────────────────────────▼─────────────────────────────────────────────┐
│                   STELLAR BLOCKCHAIN LAYER                                  │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │             RustAcademyContract  (Soroban WASM)                     │   │
│  │                                                                     │   │
│  │  Escrow      Fee Router    Privacy     Stealth     Governance       │   │
│  │  deposit()   set_fee()     set_priv()  stealth_    create_          │   │
│  │  withdraw()  per_asset()   enable()    deposit()   proposal()       │   │
│  │  refund()    rotate_col()  get_priv()  withdraw()  approve()        │   │
│  │  dispute()                                         execute()        │   │
│  │                                                                     │   │
│  │  Storage: Persistent (escrows, config, roles)                       │   │
│  │  Events:  v2 schema with stable event_type_id                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  Horizon API  ←  Stellar Network  ←  Validators                            │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow: Payment Link → Soroban Escrow

```
User creates payment link
         │
         ▼
POST /api/v1/links (Backend)
         │
         ├─► Validate asset (SAC whitelist check)
         ├─► Normalize amount (7 decimals)
         ├─► Generate commitment (KECCAK256)
         ├─► Store link metadata (Supabase)
         ▼
 Return link URL to user

Recipient clicks link
         │
         ▼
Frontend resolves link → GET /api/v1/links/:id
         │
         ▼
User approves in Freighter wallet
         │
         ▼
Backend calls RustAcademyContract.deposit()
         │
         ├─► Soroban validates: amount, salt, auth
         ├─► Token transferred to contract
         ├─► EscrowDeposited event emitted
         ▼
Ingestion module receives event
         │
         ├─► Update payment status (Supabase)
         ├─► Trigger notification to recipient
         ▼
Payment visible in dashboards
```

---

## Data Flow: Soroban Event Ingestion

```
Horizon Event Stream (SSE)
         │
         ▼
 Ingestion Module
         │
         ├─► Filter by contract ID
         ├─► Decode by event_type_id
         │         │
         │         ├── 1 (EscrowDeposited)   → create payment record
         │         ├── 2 (EscrowWithdrawn)   → mark payment complete
         │         ├── 3 (EscrowRefunded)    → mark payment refunded
         │         ├── 11 (DisputeResolved)  → update dispute state
         │         └── 45 (EmergencyMode)    → alert + halt new payments
         │
         └─► Write to Supabase + emit webhook to frontend
```

---

## DAO Governance Flow

```
Signer creates proposal
         │
         ▼
create_proposal(action, nonce, valid_until)
         │
         ├─► Verify: signer membership, nonce, expiry
         ├─► Derive proposal_id = SHA256(...)
         ├─► Store proposal on-chain
         ├─► Emit ProposalCreated event
         ▼
Other signers review and approve
         │
         ▼
approve_proposal(proposal_id) × M times
         │
         ├─► Verify: signer, proposal exists, not expired, not duplicate
         ├─► Increment approval count
         ├─► When count ≥ threshold: transition to Executable
         ▼
Any address executes
         │
         ▼
execute_proposal(proposal_id)
         │
         ├─► Apply action atomically to contract state
         ├─► Mark proposal as Executed
         ├─► Emit ProposalExecuted event
         ▼
Contract state updated
```

---

## Key Components

### Frontend (`app/frontend/`)
Next.js 15 with App Router. Handles all user interactions: course browsing, task submission, wallet connection, social feed, and payment flows. Communicates with the backend exclusively via REST API. Integrates Freighter wallet browser extension for Stellar transaction signing.

### Backend (`app/backend/`)
NestJS 10 REST API server. Manages off-chain state (users, payments, links, courses) in Supabase and coordinates all Stellar/Soroban interactions. Runs background jobs for recurring payments, event reconciliation, and notifications.

### Smart Contract (`app/contract/`)
Single Soroban WASM contract handling all on-chain logic: escrow lifecycle, fee routing, privacy controls, dispute resolution, and DAO governance. All state changes emit structured events for indexer consumption.

### Mobile App (`app/mobile/`)
React Native + Expo app targeting iOS and Android. Shares the same backend API as the web frontend. Uses expo-secure-store for key management and expo-local-authentication for biometric security.

### BackendAcademy (`BackendAcademy/`)
Separate NestJS module for academy-specific features: course/lesson management, AI-graded submissions (Claude API), badge minting, leaderboards, and the AI Mentor chat system.

---

## Networking & Hosting

| Component | Hosting | Notes |
|---|---|---|
| Frontend | Vercel | Auto-deploys from `main` branch |
| Backend | Railway / Render | Dockerized NestJS server |
| Database | Supabase | Managed PostgreSQL |
| Contract | Stellar Testnet / Mainnet | Soroban WASM deployment |
| Mobile | EAS Build + App Stores | Expo Application Services |
| CDN | Cloudflare R2 | Media and static asset storage |
| Monitoring | Sentry + Prometheus | Error tracking + metrics |
