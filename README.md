# 🌟 Stellar Basic DAO

> **A fully decentralized, learn-to-earn Rust programming academy on the Stellar blockchain. Learners earn XLM by completing tasks, tutors earn for teaching, and all rewards, credentials, and governance are trustlessly enforced by Soroban smart contracts.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Built on Stellar](https://img.shields.io/badge/Blockchain-Stellar-blueviolet?logo=stellar)](https://stellar.org)
[![Soroban Contracts](https://img.shields.io/badge/Smart%20Contracts-Soroban%20SDK%20v23-orange)](https://soroban.stellar.org)
[![NestJS Backend](https://img.shields.io/badge/Backend-NestJS%2010-red?logo=nestjs)](https://nestjs.com)
[![Next.js Frontend](https://img.shields.io/badge/Frontend-Next.js%2015-black?logo=nextdotjs)](https://nextjs.org)
[![Rust](https://img.shields.io/badge/Smart%20Contracts-Rust-orange?logo=rust)](https://www.rust-lang.org)
[![Expo Mobile](https://img.shields.io/badge/Mobile-Expo%2054-blue?logo=expo)](https://expo.dev)
[![Turborepo](https://img.shields.io/badge/Monorepo-Turborepo-EF4444)](https://turbo.build)

---

## 🌐 What Is Stellar Basic DAO?

Stellar Basic DAO is the first open-source, decentralized programming education platform on the Stellar network. It combines structured Rust education, AI-powered mentoring, Web3 incentive mechanics, and a vibrant social community — all in one platform.


- 📚 **Learn Rust** — Structured paths from beginner to Soroban/Web3 expert
- 💰 **Earn XLM** — Complete tasks and receive on-chain XLM rewards via Soroban escrow
- 🧑‍🏫 **Teach & Earn** — Build courses, review submissions, and earn from your expertise
- 🤖 **AI Mentor** — Claude-powered guidance, code review, and personalized hints
- 🔗 **On-Chain Credentials** — Certificates and badges minted as on-chain Soroban tokens
- 🗳️ **DAO Governance** — M-of-N multisig governance for all privileged protocol actions
- 📱 **Mobile-First** — React Native / Expo app for iOS and Android

Stellar Basic DAO is unique on Stellar: no other project combines Rust education, XLM-based incentive mechanics, AI tutoring, social community, and trustless governance in a single full-stack platform.

---

## ✨ Core Feature Overview

### 🎓 Learning Academy
- **Structured Learning Paths** — Beginner → Intermediate → Advanced → Soroban/Web3
- **Interactive Code Editor** — Browser-based Rust sandbox powered by WebAssembly
- **AI-Graded Submissions** — Task submissions reviewed by Claude + tutor confirmation
- **Progress & Streaks** — XP, streak bonuses, completion percentages
- **Quizzes & Challenges** — Multiple-choice, fill-in-blank, and open-ended coding tasks
- **Certification NFTs** — On-chain Soroban-minted completion certificates

### 💰 XLM Reward System (Trustless On-Chain)
- **Learn-to-Earn** — Task completions release XLM from Soroban escrow
- **Tutor Rewards** — Earnings escrowed and released based on course performance
- **Anti-Cheat Oracle** — AI-verified signatures prevent reward farming
- **Escrow Safety** — All funds held in audited Soroban escrow contracts
- **Fee Router** — Per-asset basis-point fees with platform, arbiter, and collector splits
- **Leaderboard Prizes** — Weekly top learners and tutors share prize pools

### 🤖 AI Mentor
- **Chat Interface** — Ask anything about Rust, ownership, lifetimes, Soroban
- **Code Review** — Paste snippets; AI explains errors and improvements
- **Personalized Hints** — Graduated hints without full spoilers
- **Automated Grading** — AI pre-scores submissions before tutor review
- **Learning Path Recommendations** — Next-course suggestions based on progress


### 🧑‍🏫 Tutor System
- **Verified Profiles** — Reputation scores, ratings, and specialties
- **Course Builder** — Drag-and-drop lesson editor with Markdown + code block support
- **Live Sessions** — 1-on-1 and group WebRTC-powered coding sessions
- **Submission Dashboard** — Review queue with AI pre-scoring

### 🗣️ Social Community
- **Developer Feed** — Post Rust tips, code snippets, and project showcases
- **Follow & Interact** — Twitter/X-style social interactions
- **Study Rooms** — Topic-based group chats (#rust-beginners, #soroban-dev)
- **Weekly Challenges** — Community-voted challenges with bonus XLM

### 🏆 Gamification
- **XP & Levels** — Gain XP for every activity; level up from Rusty Rookie to Soroban Sage
- **Achievement Badges** — On-chain NFT badges (First PR, Speed Coder, Perfect Score, etc.)
- **Leaderboards** — Global, weekly, and course-specific rankings
- **Streak Multipliers** — Daily streak bonuses

### 🌐 Stellar Integration
- **Freighter Wallet** — Connect and sign natively with no friction
- **XLM Dashboard** — Earned rewards, pending payouts, transaction history
- **SAC Token Support** — USDC, AQUA, yXLM and other Stellar assets
- **Path Payments** — Stellar path payment for flexible cross-asset rewards
- **Soroban Events** — All contract actions emit indexable on-chain events

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                                  │
│   Next.js 15 Web App         │    React Native / Expo Mobile App    │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ REST / WebSocket
┌──────────────────────────────▼──────────────────────────────────────┐
│                       BACKEND LAYER (NestJS)                         │
│  Auth · Payments · Links · Contracts · Ingestion · Notifications     │
│  Job Queue · Reconciliation · Analytics · Soroban Tooling            │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ Stellar SDK + Soroban RPC
┌──────────────────────────────▼──────────────────────────────────────┐
│                    STELLAR BLOCKCHAIN LAYER                          │
│   RustAcademyContract (Soroban WASM) — single monolithic contract     │
│   Escrow · Fee Router · Privacy · Stealth · Dispute · Governance    │
└─────────────────────────────────────────────────────────────────────┘
                               │ Horizon API
┌──────────────────────────────▼──────────────────────────────────────┐
│               INFRASTRUCTURE & DATA LAYER                            │
│   Supabase (PostgreSQL) · Redis · Sentry · Prometheus · Cloudflare  │
└─────────────────────────────────────────────────────────────────────┘
```


## 🛠️ Technology Stack

### Frontend (`app/frontend/`)
| Technology | Version | Purpose |
|---|---|---|
| Next.js | 15.5.9 | App Router, SSR, RSC |
| TypeScript | 5 | Type-safe codebase |
| Tailwind CSS | v4 | Utility-first styling |
| React 19 | 19.1.0 | UI framework |
| i18next | 26 | Internationalization |
| Recharts | 3 | Data visualization |
| Vitest | 3 | Unit testing |

### Backend (`app/backend/`)
| Technology | Version | Purpose |
|---|---|---|
| NestJS | 10 | REST API + WebSocket server |
| TypeScript | 5 | Type-safe backend |
| `@stellar/stellar-sdk` | 14.5.0 | Stellar network interaction |
| `@supabase/supabase-js` | 2 | PostgreSQL via Supabase |
| Sentry | 10 | Error monitoring |
| Winston | 3 | Structured logging |
| Prometheus (prom-client) | 15 | Metrics |
| Telegraf | 4 | Telegram bot |
| fast-check | 4 | Property-based fuzz tests |

### Smart Contracts (`app/contract/`)
| Technology | Version | Purpose |
|---|---|---|
| Soroban SDK | 23 | Stellar smart contract framework |
| Rust | stable | Contract language (`no_std`) |
| BLAKE3 | 1.5 | Build manifest source hash |
| Target | `wasm32-unknown-unknown` | Compiled WASM artifact |

### Mobile (`app/mobile/`)
| Technology | Version | Purpose |
|---|---|---|
| Expo | ~54 | React Native framework |
| React Native | 0.81.5 | Mobile UI |
| expo-router | ~6 | File-based navigation |
| `@stellar/stellar-base` | 14 | Stellar transaction building |
| expo-secure-store | 55 | Key/credential storage |
| expo-local-authentication | 55 | Biometric auth |

### Infrastructure
| Technology | Purpose |
|---|---|
| Docker + Docker Compose | Local and production containers |
| GitHub Actions | CI/CD pipelines |
| Vercel | Frontend hosting |
| Cloudflare R2 | Media/asset storage |
| Turborepo 2 | Monorepo build orchestration |
| pnpm 10 | Fast, disk-efficient package manager |


---

## ⚡ Soroban Smart Contract — `RustAcademyContract`

The entire on-chain logic is deployed as a single monolithic Soroban contract (`RustAcademyContract`). This minimizes cross-contract call overhead and simplifies upgrades.

### Escrow State Machine

```
[*] ──► Pending
          │
          ├──► Spent     (withdraw — proof verified, funds released)
          │
          ├──► Refunded  (refund — after expires_at)
          │
          └──► Disputed
                 │
                 ├──► Spent    (resolve_dispute → pay recipient)
                 └──► Refunded (resolve_dispute → pay owner)
```

### Contract Function Surface

| Category | Functions |
|---|---|
| **Escrow** | `deposit`, `deposit_with_commitment`, `deposit_partial`, `deposit_with_arbiters`, `withdraw`, `refund`, `partial_payment` |
| **Dispute** | `dispute`, `vote_for_dispute`, `resolve_dispute`, `resolve_dispute_multi_sig`, `resolve_expired_dispute` |
| **Privacy** | `enable_privacy`, `set_privacy`, `get_privacy`, `privacy_status`, `privacy_history` |
| **Stealth** | `register_ephemeral_key`, `stealth_withdraw`, `get_stealth_status` |
| **Commitment** | `create_amount_commitment`, `verify_amount_commitment`, `derive_escrow_id` |
| **Admin** | `initialize`, `set_admin`, `propose_admin_transfer`, `accept_admin_transfer`, `set_paused`, `pause_features`, `unpause_features`, `activate_emergency_mode` |
| **Fee** | `set_fee_config`, `set_per_asset_fee`, `set_oracle_fee_config`, `rotate_fee_collector`, `get_active_fee_collector` |
| **Upgrade** | `upgrade`, `start_upgrade`, `complete_upgrade`, `cancel_upgrade`, `set_upgrade_window`, `migrate` |
| **Roles** | `grant_role`, `revoke_role`, `clear_roles`, `get_roles` |
| **Hooks** | `register_hook`, `unregister_hook`, `get_registered_hooks` |
| **Metadata** | `get_deployment_metadata`, `get_contract_health`, `get_feature_flags`, `get_upgrade_state`, `get_supported_versions`, `check_schema_compatibility`, `get_pause_flags`, `health_check` |

### On-Chain Event Schema (v2)

Every event carries a stable `event_type_id` that never changes across releases:

| Domain | Events |
|---|---|
| **Escrow** (1–9) | EscrowDeposited (1), EscrowWithdrawn (2), EscrowRefunded (3), EscrowDisputed (4), EscrowFinalized (5), PartialPayment (6) |
| **Dispute** (10–19) | ArbiterVoteCast (10), DisputeResolved (11), DisputeAutoResolved (13) |
| **Privacy** (20–29) | PrivacyToggled (20) |
| **Stealth** (30–39) | EphemeralKeyRegistered (30), StealthWithdrawn (31) |
| **Admin** (40–79) | AdminChanged (40), ContractInitialized (41), ContractMigrated (42), ContractPaused (43), ContractUpgraded (44), EmergencyModeActivated (45), FeeConfigChanged (47), UpgradeStarted (53), UpgradeCompleted (54) |


---

## 📁 Monorepo Structure

```
stellar-basic-dao/
├── app/
│   ├── backend/              # NestJS backend API (Stellar + Supabase)
│   │   ├── src/
│   │   │   ├── analytics/
│   │   │   ├── auth/
│   │   │   ├── contracts/    # Soroban contract client wrappers
│   │   │   ├── ingestion/    # Horizon event ingestion
│   │   │   ├── job-queue/    # Custom background job system
│   │   │   ├── links/        # Payment link generation
│   │   │   ├── payments/
│   │   │   ├── reconciliation/
│   │   │   ├── soroban-tooling/
│   │   │   ├── stellar/
│   │   │   └── ...           # 35+ modules total
│   │   └── docs/             # openapi.yaml + API reference docs
│   │
│   ├── contract/             # Soroban smart contracts (Rust)
│   │   └── contracts/Folder/
│   │       └── src/
│   │           ├── lib.rs         # Contract entry points
│   │           ├── escrow.rs      # Escrow logic
│   │           ├── fee_router.rs  # Fee routing & splits
│   │           ├── dispute.rs     # Dispute resolution
│   │           ├── stealth.rs     # Stealth address deposits
│   │           ├── privacy.rs     # Privacy levels
│   │           ├── governance.rs  # DAO governance (multisig)
│   │           ├── types.rs       # All contract types
│   │           ├── events.rs      # Event schema (v2)
│   │           ├── errors.rs      # Error codes
│   │           └── storage.rs     # Storage layout
│   │
│   ├── frontend/             # Next.js 15 web app
│   │   └── src/app/          # App Router pages
│   │
│   └── mobile/               # React Native + Expo app
│
├── BackendAcademy/           # Standalone NestJS academy backend
│   └── src/                  # Courses, lessons, AI grading, etc.
│
├── docs/                     # Project-level documentation
│   ├── ARCHITECTURE.md
│   ├── SMART-CONTRACTS.md
│   ├── BACKEND.md
│   ├── FRONTEND.md
│   ├── GOVERNANCE.md
│   ├── INVARIANTS.md
│   ├── MVP-CONTRACT-SCOPE.md
│   └── MVP-ROADMAP.md
│
├── .github/
│   └── workflows/            # CI/CD: backend, frontend, contract, CD
│
├── .kiro/specs/              # Feature design specs
├── turbo.json                # Turborepo task configuration
├── pnpm-workspace.yaml       # Workspace definition
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

| Tool | Version | Notes |
|---|---|---|
| Node.js | ≥ 20 | LTS recommended |
| pnpm | ≥ 9 | `npm install -g pnpm` |
| Rust | stable | `rustup update stable` |
| Stellar CLI | latest | `cargo install --locked stellar-cli` |
| Docker | latest | For PostgreSQL + Redis |
| Freighter | browser ext | [freighter.app](https://freighter.app) |


### Installation

```bash
# 1. Clone
git clone https://github.com/Stellar-Basic-DAO/Stellar-Basic-DAO.git
cd Stellar-Basic-DAO

# 2. Install all workspace dependencies
pnpm install

# 3. Copy environment files
cp app/backend/.env.example app/backend/.env
cp BackendAcademy/.env.example BackendAcademy/.env

# 4. Start local infrastructure (PostgreSQL + Redis)
docker-compose up -d

# 5. Run development servers
pnpm dev
```

### Running Individual Apps

```bash
pnpm --filter frontend dev      # Web → http://localhost:3000
pnpm --filter backend dev       # API → http://localhost:4000
pnpm --filter mobile start      # Mobile (Expo)
```

### Building Soroban Contracts

```bash
cd app/contract

# Build WASM artifact
cargo build --target wasm32-unknown-unknown --release

# Run all contract tests
cargo test

# Deploy to Stellar Testnet
stellar contract deploy \
  --network testnet \
  --wasm target/wasm32-unknown-unknown/release/rust_academy.wasm
```

---

## 🧪 Testing

```bash
# All tests
pnpm test

# Backend unit tests
pnpm --filter backend test:unit

# Backend integration tests
pnpm --filter backend test:int

# Backend fuzz tests
pnpm --filter backend test:fuzz

# Smart contract tests (Rust)
cd app/contract && cargo test

# Frontend tests (Vitest)
pnpm --filter frontend test
```

---

## 🗳️ DAO Governance

All privileged contract actions — pausing, upgrades, fee configuration, admin rotation — are gated behind a threshold M-of-N multisig governance system.

**Proposal lifecycle:**
```
create_proposal() → approve_proposal() [×N] → execute_proposal()
                                            └→ cancel_proposal()
```

Governance state is stored fully on-chain. Proposals expire after a configurable window (max 30 days). All lifecycle events are emitted with stable `event_type_id` values for indexer consumption.

See [`docs/GOVERNANCE.md`](docs/GOVERNANCE.md) for the full specification.

---

## 🔒 Security & Financial Invariants

The contract enforces 10 core financial invariants (see [`docs/INVARIANTS.md`](docs/INVARIANTS.md)):

- **INV-01** Conservation of value — no funds created or destroyed outside protocol actions
- **INV-02** No unauthorized withdrawals — only designated recipients can claim funds
- **INV-03** No overpayment — released amount never exceeds the deposited amount
- **INV-04** No double-settlement — each escrow settles exactly once
- **INV-05** Valid state transitions only — the escrow state machine is strictly enforced
- **INV-06** Expiry monotonicity — expired escrows cannot be fulfilled
- **INV-07** Nonce uniqueness — replay attacks are rejected via per-signer nonces
- **INV-08** Authorization consistency — all state transitions require correct authorization
- **INV-09** Zero-amount safety — zero-amount escrows follow the same machine, no transfers
- **INV-10** Fee ceiling — collected fees never exceed the configured maximum

---

## 💡 Why Stellar?

| Reason | Detail |
|---|---|
| **Speed** | 3–5 second settlement — ideal for micro-reward payouts |
| **Cost** | Near-zero transaction fees enable high-frequency micro-payments |
| **Soroban** | Rust-based smart contracts — learners build what they're learning |
| **XLM Reach** | Global asset — learners worldwide receive rewards without bank accounts |
| **Freighter UX** | Low-friction Web3 onboarding for developers new to crypto |
| **SAC Tokens** | USDC, AQUA, and other assets via Stellar Asset Contracts |
| **Path Payments** | Flexible cross-asset reward distribution |

---

## 🗺️ Roadmap

### Phase 1 — Foundation ✅
- Monorepo setup and CI/CD pipelines
- Soroban escrow contract (deposit, withdraw, refund, dispute)
- Fee routing with per-asset overrides
- Privacy levels and stealth address deposits
- Backend API (NestJS + Supabase)

### Phase 2 — Academy Core 🚧
- Course + lesson data model and API
- AI-graded task submissions (Claude API)
- XLM reward pool integration with oracle verification
- Freighter wallet integration on web and mobile

### Phase 3 — Social & Governance
- Community feed, follow, chat
- Certificate NFT minting
- Multisig governance contract (on-chain proposal lifecycle)
- Leaderboards and gamification

### Phase 4 — Ecosystem
- DAO-governed curriculum
- Live tutor sessions (WebRTC)
- Cross-chain certificate portability
- Stellar Basic DAO SDK for third-party integrations

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit with conventional commits: `git commit -m 'feat: add amazing feature'`
4. Push: `git push origin feat/your-feature`
5. Open a Pull Request against `main`

See [`CONTRIBUTING.md`](CONTRIBUTING.md) for detailed guidelines.

---

## 📜 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">
  <strong>Built with 🦀 Rust, 💙 Stellar, and ❤️ for developers everywhere</strong><br/>
  <a href="https://github.com/Stellar-Basic-DAO/Stellar-Basic-DAO">GitHub</a> •  <a href="https://discord.gg/stellar-basic-dao">Discord</a> •
  <a href="https://twitter.com/stellar_basic_dao">Twitter</a>
</div>
