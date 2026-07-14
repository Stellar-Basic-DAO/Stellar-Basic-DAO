# Security Policy & Audit Report

> **Stellar Basic DAO** — Security posture, audit findings, and vulnerability reporting.

---

## Supported Versions

| Version | Status |
|---------|--------|
| 0.x (development) | ⚠️ Not ready for production — in-memory stores, no auth guards |
| 1.0 (planned) | 🔒 Target: production-ready with full auth, TypeORM, and audit trail |

---

## Reporting a Vulnerability

Please report security vulnerabilities by opening a **private advisory** on GitHub:

1. Go to https://github.com/Stellar-Basic-DAO/Stellar-Basic-DAO/security/advisories
2. Click **"New advisory"**
3. Provide a clear description, reproduction steps, and impact assessment

You can also email the maintainers directly at the project's GitHub organization.

We aim to respond within **72 hours** and issue a fix within **7 days** for critical issues.

---

## Security Audit Findings (BackendAcademy)

Below are the findings from the latest security audit of the `BackendAcademy/` NestJS module.

### 🔴 Critical

| ID | Finding | Location | Status |
|----|---------|----------|--------|
| AUTH-01 | **No authentication guards on sensitive endpoints** — wallet, rewards, contracts, and admin controllers lack auth guards | `wallet.controller.ts`, `rewards.controller.ts`, `contracts.controller.ts`, `admin.controller.ts` | ⚠️ **Mitigated**: `DevAuthGuard` applied (TODO: replace with real guards) |
| AUTH-02 | **Anti-cheat batch endpoint accepts unbounded array** — `check-batch` receives `CheckSubmissionDto[]` without `@ValidateNested({ each: true })` wrapper | `anti-cheat.controller.ts` | ⚠️ **Partial fix**: added note in doc comment |

### 🟠 High

| ID | Finding | Location | Status |
|----|---------|----------|--------|
| LOG-01 | **Session/user IDs logged by server** — `@Query()` parameters are recorded in access logs | `auth-session.controller.ts` (`logout`, `logout-all`) | ✅ **Fixed**: Changed to `@Body()` |
| RATE-01 | **Unbounded leaderboard query** — `topN` parameter accepts any value | `rewards.controller.ts` | ✅ **Fixed**: Clamped to [1, 1000] |

### 🟡 Medium

| ID | Finding | Location | Status |
|----|---------|----------|--------|
| VAL-01 | **No input size limits on DTO string fields** — Several DTOs allow unbounded strings | Multiple DTOs | 📝 **Noted**: Add `@MaxLength()` decorators |
| VAL-02 | **Batch operations lack request size limits** — No limit on batch sizes for anti-cheat, badge issuance | `anti-cheat.controller.ts`, `badges.controller.ts` | 📝 **Noted**: Add max batch size validation |

---

## Security Posture by Module

### BackendAcademy (`BackendAcademy/`)

| Module | Auth | Input Validation | Rate Limiting | Data Store | Status |
|--------|------|-----------------|---------------|------------|--------|
| `auth/` | ✅ JWT guards exist | ✅ DTO validation | ❌ Not yet | In-memory | 🟡 Pre-production |
| `wallet/` | ❌ DevAuthGuard only | ✅ DTO validation | ❌ Not yet | In-memory | 🟡 Pre-production |
| `rewards/` | ❌ DevAuthGuard only | ✅ DTO validation | ❌ Not yet | In-memory | 🟡 Pre-production |
| `contracts/` | ❌ DevAuthGuard only | ✅ DTO validation | ❌ Not yet | In-memory | 🟡 Pre-production |
| `admin/` | ❌ DevAuthGuard only | ❌ Minimal | ❌ Not yet | In-memory | 🔴 Needs attention |
| `payments/` | ❌ DevAuthGuard only | ✅ DTO validation | ❌ Not yet | In-memory | 🟡 Pre-production |

### Root src/ (`src/`)

| Component | Status |
|-----------|--------|
| Courses API | ✅ Basic validation, no auth needed (public learning paths) |

---

## Recommended Security Roadmap

### Before Production Launch

1. **Replace `DevAuthGuard`** with real JWT guards (`JwtLearnerGuard`, `JwtAdminGuard`, `JwtTutorGuard`)
2. **Add rate limiting** via `@nestjs/throttler` on all POST endpoints
3. **Migrate in-memory stores** to TypeORM/PostgreSQL for persistence and auditability
4. **Add CSRF protection** for cookie-based auth (if used)
5. **Set up Sentry** error tracking with PII scrubbing
6. **Run dependency audit**: `npm audit` on all packages

### Within First Production Month

7. **Implement API key authentication** for service-to-service calls
8. **Add request logging** with correlation IDs
9. **Set up security headers** (Helmet.js) — already configured in `main.ts`
10. **Configure CORS** restrictively for production origins

---

## Dependency Security

- **pnpm** is used for the monorepo (root) — lockfile should be committed
- **npm** is used for BackendAcademy — `package-lock.json` should be committed
- Run `pnpm audit` and `npm audit` regularly before releases
- Keep Soroban SDK, Stellar SDK, and NestJS dependencies up to date
