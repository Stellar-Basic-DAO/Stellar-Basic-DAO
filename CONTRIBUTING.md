# Contributing to Stellar Basic DAO

Welcome! **Stellar Basic DAO** (codename `Stellar Basic DAO` in source code and the deployed Soroban contract) is an open-source platform and we actively welcome contributions from the community. This guide covers how to get started, what our standards are, and how the review process works.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Getting Started](#getting-started)
3. [Branch Naming](#branch-naming)
4. [Commit Standards](#commit-standards)
5. [Smart Contract Contributions](#smart-contract-contributions)
6. [Backend Contributions](#backend-contributions)
7. [Frontend Contributions](#frontend-contributions)
8. [Documentation Contributions](#documentation-contributions)
9. [Testing Requirements](#testing-requirements)
10. [Pull Request Process](#pull-request-process)
11. [Code of Conduct](#code-of-conduct)

---

## Project Overview

Stellar Basic DAO is a monorepo organized under `app/`:

| Directory | Stack | CI |
|---|---|---|
| `app/backend/` | NestJS 10 + TypeScript | `backend.yml` |
| `app/frontend/` | Next.js 15 + TypeScript | `frontend-ci.yml` |
| `app/mobile/` | Expo 54 + React Native | `mobile-release.yml` |
| `app/contract/` | Rust + Soroban SDK 23 | `contract.yml` |
| `BackendAcademy/` | NestJS 10 + TypeORM | — |
| `docs/` | Markdown | — |

---

## Getting Started

```bash
# Fork and clone
git clone https://github.com/Stellar-Basic-DAO/Stellar-Basic-DAO.git
cd Stellar-Basic-DAO

# Install all workspace deps
pnpm install

# Copy environment files
cp app/backend/.env.example app/backend/.env

# Start local services
docker-compose up -d

# Run development servers
pnpm dev
```

### Requirements

- **Node.js** ≥ 20
- **pnpm** ≥ 9
- **Rust** (stable) + `wasm32-unknown-unknown` target
- **Stellar CLI** (`cargo install --locked stellar-cli`)
- **Docker** + Docker Compose

---

## Branch Naming

| Type | Format | Example |
|---|---|---|
| Feature | `feat/<short-description>` | `feat/governance-multisig` |
| Bug fix | `fix/<short-description>` | `fix/escrow-expiry-edge-case` |
| Docs | `docs/<short-description>` | `docs/contract-deploy-guide` |
| Refactor | `refactor/<short-description>` | `refactor/fee-router-types` |
| Test | `test/<short-description>` | `test/governance-approval-flow` |
| Chore | `chore/<short-description>` | `chore/update-soroban-sdk` |

Always branch from `main`:
```bash
git checkout main && git pull
git checkout -b feat/my-feature
```

---

## Commit Standards

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]
[optional footer]
```

**Types:** `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `perf`, `ci`

**Scopes:** `contract`, `backend`, `frontend`, `mobile`, `docs`, `ci`, `governance`, `escrow`

**Examples:**
```
feat(contract): add M-of-N governance proposal lifecycle
fix(backend): handle Horizon API timeout in ingestion module
docs(contract): add escrow state machine diagram
test(contract): add governance replay protection tests
```

---

## Smart Contract Contributions

The Soroban contract is located at `app/contract/`. All contract changes have the highest review bar.

### Setup

```bash
# Install Rust wasm target
rustup target add wasm32-unknown-unknown

# Build the contract
cd app/contract
cargo build --target wasm32-unknown-unknown --release

# Run tests
cargo test

# Check with clippy
cargo clippy --all-targets --all-features -- -D warnings

# Check formatting
cargo fmt --all -- --check
```

### Contract Standards

| Standard | Requirement |
|---|---|
| **Test coverage** | ≥ 90% before mainnet |
| **No floating-point** | All amounts use `i128` |
| **Error codes** | New errors need documented codes in `errors.rs` |
| **Events** | Every state change must emit an event with stable `event_type_id` |
| **Storage keys** | New storage keys added to `DataKey` enum with doc comment |
| **Upgrade safety** | Breaking storage changes need migration logic in `migrate()` |
| **Authorization** | Every state-mutating entry point must require appropriate auth |

### Adding New Contract Functionality

1. Add the Rust function in the relevant module (`escrow.rs`, `governance.rs`, etc.)
2. Expose it as a public entry point in `lib.rs` with full doc comment
3. Add error codes to `errors.rs` if needed
4. Add `DataKey` variants to `storage.rs` if adding new storage
5. Emit an on-chain event with a stable `event_type_id` in `events.rs`
6. Write unit tests in `<module>_test.rs`
7. Update `app/contract/README.md`
8. Update `docs/SMART-CONTRACTS.md`

---

## Backend Contributions

The backend is located at `app/backend/`.

### Setup

```bash
cd app/backend
pnpm install
cp .env.example .env
# Fill in required vars: NETWORK, SUPABASE_URL, SUPABASE_ANON_KEY
pnpm dev
```

### Standards

- **DTOs** — all request/response bodies must use `class-validator` DTOs
- **Swagger** — all new endpoints need `@ApiTags`, `@ApiOperation`, `@ApiResponse` decorators
- **Tests** — unit tests for services, integration tests for controllers
- **Environment variables** — document in `.env.example` and update `env.schema.ts`
- **Error handling** — use NestJS `HttpException` with structured responses
- **No secrets in code** — use environment variables only

See [`app/backend/CONTRIBUTING.md`](app/backend/CONTRIBUTING.md) for full backend standards.

---

## Frontend Contributions

The frontend is at `app/frontend/`.

### Setup

```bash
cd app/frontend
npm install
npm run dev
```

### Standards

- **TypeScript strict mode** — no `any` without justification
- **Accessibility** — all interactive elements must be keyboard accessible and have ARIA labels
- **No hardcoded HTTP URLs** — use HTTPS or environment variables (CI will catch this)
- **i18n** — all user-visible strings must use the i18n system
- **No inline styles** — use Tailwind utility classes

---

## Documentation Contributions

Documentation lives in:

- `README.md` — project overview
- `docs/` — architecture, contracts, backend, governance, invariants
- `app/contract/README.md` — contract module reference
- `app/backend/docs/` — API reference and guides

### Doc Standards

- Use clear, active voice
- Include code examples for all technical steps
- Keep code blocks syntactically correct
- Update docs alongside any code changes they describe

---

## Testing Requirements

| Layer | Framework | Minimum |
|---|---|---|
| Smart contract | `cargo test` + `proptest` | ≥ 90% coverage |
| Backend (unit) | Jest | All services |
| Backend (integration) | Jest + supertest | All controllers |
| Frontend | Vitest + Testing Library | UI components |
| Mobile | jest-expo | Core flows |

### Running All Tests

```bash
# All JS/TS tests
pnpm test

# Contract tests
cd app/contract && cargo test

# Backend fuzz tests
pnpm --filter backend test:fuzz

# Frontend tests
pnpm --filter frontend test
```

---

## Pull Request Process

1. **Open a draft PR early** — this signals work-in-progress and gets early feedback
2. **Fill in the PR template** — summary, what was tested, any breaking changes
3. **Ensure all CI checks pass** — backend lint/build, frontend lint/type-check/build, contract build/test
4. **Request review** — at least 1 reviewer required; 2 for contract changes
5. **Address review comments** — respond to each comment; resolve before merging
6. **Squash and merge** — keep history clean

### PR Title Format

Follow the same convention as commits: `feat(contract): add governance multisig`

### Review Standards for Contract Changes

Contract PRs receive extra scrutiny:
- Security audit of auth checks and state transitions
- Verification of event emission for all state changes
- Check for storage migration if fields changed
- Review of error code uniqueness
- Test coverage verification

---

## Code of Conduct

We follow the [Contributor Covenant](https://www.contributor-covenant.org/) Code of Conduct.

Key points:
- Be respectful and inclusive in all interactions
- Assume good intent and ask clarifying questions
- No harassment, discrimination, or personal attacks
- Focus feedback on the code, not the contributor

Report conduct issues to the project maintainers via GitHub issues (private report option).

---

## Good First Issues

Look for issues labeled `good-first-issue` or `help-wanted` on GitHub.

**Areas where contributions are especially welcome:**
- Documentation improvements and examples
- Additional contract tests and fuzz tests
- Frontend UI components and accessibility improvements
- i18n translations
- Mobile app screens
- Backend API endpoint documentation (Swagger)

Top contributors earn XLM rewards and recognition in the platform — contributing to Stellar Basic DAO earns you contribution XP on the academy itself.
