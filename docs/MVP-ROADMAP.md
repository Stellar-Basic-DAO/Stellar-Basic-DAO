# Stellar Basic DAO — MVP Roadmap

> **8-week plan to launch a production-ready, fully on-chain learn-to-earn Rust academy on Stellar Testnet.**

---

## Overview

The MVP focuses on the minimal viable slice: a user can connect their Freighter wallet, enroll in a Rust course, complete tasks, receive AI-graded scores, and get XLM paid out via Soroban escrow — all on Stellar Testnet.

### Scope Decision

| Feature | MVP | Notes |
|---|---|---|
| Core escrow + payments | ✅ On-chain | Critical for trustless reward distribution |
| Platform fee routing | ✅ On-chain | Basis-point static fee routing |
| Course + lesson catalog | ✅ Off-chain + backend | Stored in Supabase |
| Task submission + AI grading | ✅ Off-chain | Claude API + tutor confirmation |
| Freighter wallet integration | ✅ Frontend | Web only for MVP |
| Certificate NFT minting | 🔜 Post-MVP | Phase 2 |
| DAO governance | 🔜 Post-MVP | Phase 3 (spec complete) |
| Stealth deposits | 🔜 Post-MVP | Phase 3 |
| Live tutor sessions (WebRTC) | 🔜 Post-MVP | Phase 4 |
| Mobile app | 🔜 Post-MVP | Phase 4 |

---

## Week-by-Week Plan

### Week 1–2 — Foundation

**Goal:** Local development environment fully operational with contract deployed on testnet.

**Smart Contract:**
- [ ] Build `StellarBasicDAOContract` WASM (cargo build + tests passing)
- [ ] Deploy to Stellar Testnet
- [ ] Initialize contract with admin address
- [ ] Configure platform fee (100 bps / 1%)
- [ ] Verify `deposit()` and `withdraw()` flows on testnet

**Backend:**
- [ ] NestJS server boots from `.env` with required vars
- [ ] Soroban tooling module: contract client working
- [ ] Basic payment link CRUD API
- [ ] Horizon ingestion: `EscrowDeposited` and `EscrowWithdrawn` events consumed

**Infrastructure:**
- [ ] Supabase project created (tables: users, courses, tasks, submissions, payments)
- [ ] Docker Compose local stack running
- [ ] GitHub Actions CI: all three workflows (contract, backend, frontend) passing

---

### Week 3–4 — Backend Core

**Goal:** Full payment lifecycle and user onboarding working end-to-end.

**Backend:**
- [ ] Auth module: JWT sign-up/sign-in with Stellar public key
- [ ] Usernames: register and resolve Stellar addresses to human-readable names
- [ ] Courses API: CRUD for courses, lessons, tasks
- [ ] Task submissions API: receive submission, queue for grading
- [ ] AI grading integration: Claude API grades submitted code
- [ ] Reward payout: call `StellarBasicDAOContract.withdraw()` on confirmed grade
- [ ] Notifications: email/push on payment received

**Contract:**
- [ ] Verify `deposit_partial()` for installment-style rewards
- [ ] Set up recurring payment job infrastructure

---

### Week 5–6 — Frontend MVP

**Goal:** Users can enroll, complete a task, and receive XLM — all in the web UI.

**Frontend:**
- [ ] Freighter wallet connection (connect / disconnect)
- [ ] Course catalog page with search
- [ ] Course player: lesson + interactive code editor (Monaco/WebAssembly)
- [ ] Task submission form + real-time grading status
- [ ] XLM balance dashboard (earned, pending, history)
- [ ] Payment link generation + QR code display
- [ ] Testnet badge in header for non-mainnet

---

### Week 7 — QA & Polish

**Goal:** Platform is stable enough for external beta testers.

- [ ] End-to-end test: sign up → enroll → submit task → receive XLM reward
- [ ] Error handling: all failure paths show meaningful user messages
- [ ] Mobile browser responsive check
- [ ] Accessibility audit (keyboard nav, ARIA, contrast)
- [ ] Rate limiting verified on all sensitive endpoints
- [ ] Sentry error tracking enabled
- [ ] Prometheus metrics endpoint live

---

### Week 8 — Testnet Launch

**Goal:** Public testnet launch with at least 3 starter courses.

- [ ] 3 complete Rust beginner courses seeded in database
- [ ] Reward pool funded (e.g., 1000 XLM testnet)
- [ ] Public URL live (Vercel frontend + Railway/Render backend)
- [ ] README and docs updated to final state
- [ ] Testnet launch announcement prepared
- [ ] Mainnet readiness checklist reviewed (admin multisig, security audit plan)

---

## Feature Prioritization (Post-MVP)

| Priority | Feature | Phase |
|---|---|---|
| 1 | Certificate NFT minting (on-chain) | 2 |
| 2 | Social feed + follow system | 2 |
| 3 | DAO governance (multisig, already spec'd) | 3 |
| 4 | Leaderboards and gamification | 3 |
| 5 | Mobile app (React Native/Expo) | 4 |
| 6 | Live tutor sessions (WebRTC/LiveKit) | 4 |
| 7 | Stealth deposit privacy | 4 |
| 8 | Cross-chain certificate portability | 5 |

---

## Mainnet Readiness Checklist

Before deploying `StellarBasicDAOContract` to Stellar Mainnet:

- [ ] External security audit completed
- [ ] ≥ 90% contract test coverage verified
- [ ] Admin address is a Stellar multisig account (2-of-3 minimum)
- [ ] Upgrade window configured (`set_upgrade_window()`)
- [ ] Emergency mode procedure documented and tested
- [ ] Fee configuration verified and signed off by team
- [ ] WASM hash pinned in all client configurations
- [ ] DAO governance signer set initialized (3-of-5 recommended)
- [ ] Horizon event ingestion tested at mainnet volume
- [ ] Incident response runbook documented
