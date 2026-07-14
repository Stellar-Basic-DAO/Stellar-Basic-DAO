# Frontend Architecture Guide

> **Next.js 15 web application for Stellar Basic DAO — the primary user interface for learning, earning, and community.**

---

## Overview

The frontend is a Next.js 15 App Router application located at `app/frontend/`. It communicates exclusively with the backend REST API and integrates with the Freighter browser wallet for Stellar transaction signing.

**Stack:**

| Technology | Version | Purpose |
|---|---|---|
| Next.js | 15.5.9 | App Router, SSR, RSC |
| React | 19.1.0 | UI framework |
| TypeScript | 5 | Type safety |
| Tailwind CSS | v4 | Utility-first styling |
| i18next | 26 | Internationalization |
| Recharts | 3 | Data visualization (dashboards) |
| react-qr-code | 2 | QR code display for payment links |
| Vitest | 3 | Unit testing |

---

## Security Configuration

Security headers are configured globally in `next.config.ts`:

| Header | Value | Purpose |
|---|---|---|
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | HTTPS enforcement |
| `X-Content-Type-Options` | `nosniff` | MIME sniffing prevention |
| `X-Frame-Options` | `DENY` | Clickjacking prevention |
| `X-XSS-Protection` | `1; mode=block` | XSS filter |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Referrer control |

**Hardcoded HTTP URLs are blocked by CI** — the frontend workflow checks for non-localhost HTTP URLs and fails the build if any are found.

---

## Page Structure (`app/frontend/src/app/`)

```
app/
├── (auth)/              # Login, register, wallet connect
├── (dashboard)/         # Learner dashboard, XP, rewards
├── (tutor)/             # Tutor portal, course builder
├── academy/             # Course catalog + player
├── ai-mentor/           # AI Mentor chat interface
├── social/              # Community feed
├── chat/                # Messaging + study rooms
├── wallet/              # Stellar wallet + transaction history
├── leaderboard/         # Rankings
├── settings/            # Account settings
├── notifications/       # Notification center
└── [username]/          # Public learner/tutor profile
```

---

## Environment Variables

Create `app/frontend/.env.local` from the example:

```env
# Backend API
NEXT_PUBLIC_STELLAR_BASIC_DAO_API_URL=http://localhost:4000
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Stellar
NEXT_PUBLIC_STELLAR_NETWORK=testnet

# Contract IDs (resolved from backend Contract Registry)
NEXT_PUBLIC_CONTRACT_ID=<soroban-contract-id>

# Error Reporting (optional)
NEXT_PUBLIC_ERROR_REPORTING_ENABLED=false
NEXT_PUBLIC_APP_VERSION=0.1.0
```

**Important:** All environment variables prefixed `NEXT_PUBLIC_` are exposed to the browser. Never put secrets in these variables.

---

## Freighter Wallet Integration

The frontend uses the [Freighter API](https://www.freighter.app/developer-docs) for:

1. **Connecting** — request user's public key
2. **Signing** — sign XDR transactions built by the backend
3. **Network detection** — verify user is on the correct Stellar network

```typescript
// Check if Freighter is installed
const isInstalled = await isConnected();

// Request public key
const { publicKey } = await requestPublicKey();

// Sign a transaction
const { signedTransaction } = await signTransaction(xdrString, {
  network: 'TESTNET',
  accountToSign: publicKey,
});
```

---

## Development

```bash
# Install deps
cd app/frontend
npm install

# Run dev server (Turbopack)
npm run dev   # → http://localhost:3000

# Build
npm run build

# Lint
npx eslint . --max-warnings 0

# Type check
npx tsc --noEmit

# Run tests
npx vitest --run
```

---

## CI Pipeline (`frontend-ci.yml`)

On every push/PR to `app/frontend/**`:

1. **Lint** — `eslint` with zero warnings tolerance
2. **Type check** — `tsc --noEmit`
3. **Build** — `next build` (requires all env vars from secrets)
4. **Security scan** — `npm audit --audit-level=moderate`
5. **HTTP URL check** — fails if non-localhost HTTP URLs found in source

---

## i18n

All user-visible strings use `i18next` + `react-i18next`. Translation files live at:

```
app/frontend/src/i18n/
├── en/              # English (default)
├── es/              # Spanish
└── ...              # Add new locales here
```

Add new strings to the English file first, then send for translation before shipping.

---

## Accessibility

All interactive components must:
- Be keyboard navigable (Tab, Enter, Space, arrow keys)
- Have descriptive `aria-label` or `aria-labelledby` attributes
- Meet WCAG 2.1 AA contrast ratios (minimum 4.5:1 for normal text)
- Not rely on color alone to convey information

Run `axe` or browser DevTools accessibility audit before raising PRs for UI changes.
