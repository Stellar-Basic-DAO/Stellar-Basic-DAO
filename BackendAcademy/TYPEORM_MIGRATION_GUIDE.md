# BackendAcademy — TypeORM Migration Guide

> **Migrating in-memory stores (`Map<>`) to TypeORM-managed PostgreSQL tables.**

---

## Why Migrate?

The BackendAcademy currently uses in-memory `Map<>` stores in many services. This is sufficient for development and testing but **not suitable for production**:

- Data is lost on server restart
- No persistence between instances
- No querying, indexing, or aggregation
- No audit trail or data integrity constraints

---

## Services Needing Migration

| Service | File | Store | Entities Needed | Priority |
|---------|------|-------|-----------------|----------|
| `WalletService` | `wallet/wallet.service.ts` | `wallets`, `transactions`, `verifications` | `Wallet`, `Transaction`, `Verification` | 🔴 High |
| `RewardsService` | `rewards/rewards.service.ts` | `xp`, `prizePools`, `streaks` | `UserXp`, `PrizePool`, `LeaderboardEntry` | 🔴 High |
| `ContractsService` | `contracts/contracts.service.ts` | `reputations`, `certificates`, `badges`, `payouts`, `deployments`, `proposals` | Multiple entities | 🟡 Medium |
| `SocialService` | `social/social.service.ts` | `posts`, `followers`, `hashtags` | `Post`, `Follow`, `Hashtag` | 🟡 Medium |
| `AntiCheatService` | `security/anti-cheat.service.ts` | `analysisResults` | `SubmissionAnalysis` | 🟡 Medium |
| `ChallengesService` | `challenges/challenges.service.ts` | `votes` | `ChallengeVote` | 🟢 Low |
| `SearchService` | `search/search.service.ts` | `users`, `posts`, `courses` | Already uses `CourseService` | 🟢 Low |

---

## Migration Patterns

### Pattern 1: Simple Entity (Recommended for most cases)

1. Create an entity file in the module's `entities/` directory
2. Register it in the module's `TypeOrmModule.forFeature()`
3. Inject `@InjectRepository()` in the service
4. Replace `Map` operations with `repository` operations

**Before:**
```typescript
@Injectable()
export class WalletService {
  private readonly wallets = new Map<string, Wallet>();

  async getWallet(address: string): Promise<Wallet | null> {
    return this.wallets.get(address) ?? null;
  }

  async registerWallet(dto: RegisterWalletDto): Promise<Wallet> {
    const wallet = { id: crypto.randomUUID(), ...dto, createdAt: new Date() };
    this.wallets.set(wallet.id, wallet);
    return wallet;
  }
}
```

**After:**
```typescript
@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(WalletEntity)
    private readonly walletRepo: Repository<WalletEntity>,
  ) {}

  async getWallet(address: string): Promise<WalletEntity | null> {
    return this.walletRepo.findOne({ where: { address } });
  }

  async registerWallet(dto: RegisterWalletDto): Promise<WalletEntity> {
    const wallet = this.walletRepo.create({ ...dto });
    return this.walletRepo.save(wallet);
  }
}
```

### Pattern 2: Composite Key (Multiple Maps)

When a service uses multiple `Map<>` instances for related data, migrate them to separate entities with foreign key relationships.

**Before:**
```typescript
private readonly wallets = new Map<string, Wallet>();
private readonly transactions = new Map<string, Transaction>();
```

**After:**
```typescript
// WalletEntity with @OneToMany(() => TransactionEntity, tx => tx.wallet)
// TransactionEntity with @ManyToOne(() => WalletEntity, wallet => wallet.transactions)
```

### Pattern 3: Nested Maps

When a service uses `Map<string, Map<string, T>>` (e.g., challenges votes keyed by `challengeId -> userId`), create a single entity with a composite unique constraint:

```typescript
@Entity()
@Unique(['challengeId', 'userId'])
export class ChallengeVoteEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  challengeId: string;

  @Column()
  userId: string;

  @Column()
  vote: string;

  @CreateDateColumn()
  createdAt: Date;
}
```

---

## Module Registration

After creating entities, register them in the module:

```typescript
@Module({
  imports: [
    TypeOrmModule.forFeature([WalletEntity, TransactionEntity]),
    // ...
  ],
  providers: [WalletService],
  exports: [WalletService],
})
export class WalletModule {}
```

---

## Running Migrations

```bash
# Generate a migration
npx typeorm migration:generate src/database/migrations/MigrationName

# Run pending migrations
npx typeorm migration:run

# Revert last migration
npx typeorm migration:revert
```

Make sure `DATABASE_URL` is configured in `.env`.
