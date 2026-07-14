# BackendAcademy — Contributing Guide

> **Standalone NestJS backend for the Stellar Basic DAO Academy module — courses, lessons, AI grading, rewards, and gamification.**

This guide covers setup, structure, standards, and testing for the `BackendAcademy/` module.

---

## Quick Start

```bash
# From the monorepo root
cd BackendAcademy

# Install dependencies
npm install

# Copy and configure environment
cp .env.example .env

# Build
npm run build

# Run in development mode
npm run start:dev

# Run tests
npm test
```

---

## Project Structure

```
BackendAcademy/
├── src/
│   ├── app.module.ts          # Root NestJS module
│   ├── main.ts                # Application bootstrap
│   │
│   ├── ai/                    # AI Mentor chat, hint system, pre-scoring
│   ├── analytics/             # Platform analytics events
│   ├── assets/                # File upload and static asset serving
│   ├── auth/                  # JWT-based authentication + session management
│   ├── badges/                # Achievement badge system
│   ├── challenges/            # Weekly community challenges
│   ├── chat/                  # Real-time chat and study rooms
│   ├── config/                # Environment configuration module
│   ├── contracts/             # Soroban contract interaction wrappers
│   ├── courses/               # Course CRUD, versioning, progress tracking
│   ├── jobs/                  # Background job processing
│   ├── leaderboard/           # XP ranking and leaderboards
│   ├── lessons/               # Lesson management
│   ├── logging/               # Winston-based structured logging
│   ├── monitoring/            # Prometheus metrics and health checks
│   ├── notifications/         # Push and email notifications
│   ├── onboarding/            # New user onboarding flows
│   ├── pathfinding/           # Learning path recommendations
│   ├── payments/              # Stellar payment history
│   ├── rewards/               # XP, levels, streaks, referrals, prize pools
│   ├── search/                # Course and user search
│   ├── security/              # Anti-cheat analysis
│   ├── sessions/              # Office hours session management
│   ├── social/                # Social feed, hashtags, moderation
│   ├── submissions/           # Task submission grading pipeline
│   ├── tasks/                 # Task CRUD
│   ├── users/                 # User profiles, tutor profiles, verification
│   └── wallet/                # Stellar wallet registration and verification
│
├── .env.example               # Environment variable template
├── nest-cli.json              # NestJS CLI configuration
├── tsconfig.json              # TypeScript configuration
├── jest.config.ts             # Jest test configuration
└── package.json               # Dependencies and scripts
```

---

## Code Standards

### TypeScript

- **Strict mode is enabled** in `tsconfig.json` but with `strictNullChecks: false` and `noImplicitAny: false` — be mindful of these relaxed checks.
- New code should aim for strict null safety even if the config allows loose checks.
- Use `import type` for type-only imports where possible.

### NestJS Conventions

- **DTOs** — All request bodies must use `class-validator` decorators for validation.
- **Swagger** — New endpoints should include `@ApiTags`, `@ApiOperation`, and `@ApiResponse` decorators.
- **Controllers** — Keep controllers thin; business logic goes in services.
- **Services** — Use `@Injectable()` and inject dependencies via constructor.
- **Modules** — Each feature domain gets its own `@Module()` with dedicated controller, service, and interfaces.

### Security

- Query parameters (`@Query`) can leak sensitive data in server logs. Use `@Body()` for session IDs, user IDs, and other sensitive values.
- Always validate and sanitize user input via DTO decorators.
- Sensitive endpoints (wallet, rewards, admin) should be guarded with appropriate auth guards before production use.
- Anti-cheat and admin routes should have explicit TODO comments if auth is not yet implemented.

---

## Testing

| Test Type | Framework | Location | Command |
|-----------|-----------|----------|---------|
| Unit tests | Jest | `src/**/*.spec.ts` | `npx jest` |
| Integration | Jest + supertest | `src/**/*.controller.spec.ts` | `npx jest <pattern>` |

### Writing Tests

- **Unit tests** instantiate services directly with mocked dependencies.
- **Integration tests** use `@nestjs/testing` `Test.createTestingModule` with real controllers and services.
- Mock TypeORM repositories using in-memory classes that implement the `Repository<T>` surface.
- Name test files `<name>.spec.ts` (Jest discovery pattern).

```typescript
// Example unit test pattern
const module = await Test.createTestingModule({
  controllers: [MyController],
  providers: [MyService],
}).compile();
```

### Running Tests

```bash
# All tests
npm test

# Single test file
npx jest src/users/tutor-profile.service.spec.ts

# With coverage
npx jest --coverage
```

---

## Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | 3000 | HTTP server port |
| `NODE_ENV` | No | development | Environment mode |
| `DATABASE_URL` | For DB features | — | PostgreSQL connection string |
| `JWT_SECRET` | For auth | — | JWT signing secret |
| `AI_PROVIDER` | No | mock | AI provider: claude, openai, or mock |
| `ANTHROPIC_API_KEY` | For Claude | — | Anthropic API key |
| `OPENAI_API_KEY` | For OpenAI | — | OpenAI API key |

---

## Pull Request Process

1. Branch from `main`: `git checkout -b feat/my-feature`
2. Follow [Conventional Commits](https://www.conventionalcommits.org/): `feat(scope): description`
3. Ensure all tests pass: `npm test`
4. Run type check: `npx tsc --noEmit`
5. Open a PR against `main` in the monorepo

---

## Areas Needing Contribution

- **Auth guards** — Many controllers lack authentication guards (marked with TODO comments).
- **Database integration** — Several services use in-memory stores (Maps) that should be migrated to TypeORM repositories.
- **Test coverage** — Additional integration tests for controllers are welcome.
- **Swagger documentation** — Add `@ApiTags` and `@ApiOperation` decorators to undocumented endpoints.
