import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

/**
 * Initial schema migration — creates core tables for BackendAcademy.
 *
 * Tables:
 * - wallets: Stellar wallet accounts linked to users
 * - user_xp: Experience points and level progression
 * - prize_pools: Reward distribution pools
 * - transaction_history: Stellar transaction records
 * - social_posts: Community feed content
 * - submission_analyses: Anti-cheat analysis results
 * - challenge_votes: Community voting records
 *
 * Indexes are created for frequently queried columns (userId, createdAt).
 */
export class InitialSchema1700000000000 implements MigrationInterface {
  name = 'InitialSchema1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── Wallets table ──────────────────────────────────────────────────
    await queryRunner.createTable(
      new Table({
        name: 'wallets',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'userId', type: 'varchar', length: '128', isNullable: false },
          { name: 'address', type: 'varchar', length: '56', isUnique: true },
          { name: 'assetCode', type: 'varchar', length: '12', default: "'XLM'" },
          { name: 'isActive', type: 'boolean', default: true },
          { name: 'createdAt', type: 'timestamptz', default: 'now()' },
          { name: 'updatedAt', type: 'timestamptz', default: 'now()' },
        ],
      }),
      true,
    );
    await queryRunner.createIndex('wallets', new TableIndex({ columnNames: ['userId'] }));

    // ── User XP & Progression ──────────────────────────────────────────
    await queryRunner.createTable(
      new Table({
        name: 'user_xp',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'userId', type: 'varchar', length: '128', isUnique: true },
          { name: 'xp', type: 'integer', default: 0 },
          { name: 'level', type: 'integer', default: 1 },
          { name: 'createdAt', type: 'timestamptz', default: 'now()' },
          { name: 'updatedAt', type: 'timestamptz', default: 'now()' },
        ],
      }),
      true,
    );
    await queryRunner.createIndex('user_xp', new TableIndex({ columnNames: ['xp'] }));

    // ── Prize Pools ────────────────────────────────────────────────────
    await queryRunner.createTable(
      new Table({
        name: 'prize_pools',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'totalAmount', type: 'decimal', precision: 20, scale: 7 },
          { name: 'currency', type: 'varchar', length: '12', default: "'XLM'" },
          { name: 'distributedAt', type: 'timestamptz', isNullable: true },
          { name: 'createdAt', type: 'timestamptz', default: 'now()' },
        ],
      }),
      true,
    );

    // ── Social Posts ───────────────────────────────────────────────────
    await queryRunner.createTable(
      new Table({
        name: 'social_posts',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'userId', type: 'varchar', length: '128' },
          { name: 'content', type: 'text' },
          { name: 'status', type: 'varchar', length: '20', default: "'pending'" },
          { name: 'likeCount', type: 'integer', default: 0 },
          { name: 'commentCount', type: 'integer', default: 0 },
          { name: 'repostCount', type: 'integer', default: 0 },
          { name: 'createdAt', type: 'timestamptz', default: 'now()' },
          { name: 'updatedAt', type: 'timestamptz', default: 'now()' },
        ],
      }),
      true,
    );
    await queryRunner.createIndex('social_posts', new TableIndex({ columnNames: ['userId', 'status'] }));
    await queryRunner.createIndex('social_posts', new TableIndex({ columnNames: ['createdAt'] }));

    // ── Submission Analyses ────────────────────────────────────────────
    await queryRunner.createTable(
      new Table({
        name: 'submission_analyses',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'learnerId', type: 'varchar', length: '128' },
          { name: 'taskId', type: 'varchar', length: '128' },
          { name: 'flagged', type: 'boolean', default: false },
          { name: 'riskLevel', type: 'varchar', length: '20', default: "'low'" },
          { name: 'confidence', type: 'float', default: 0 },
          { name: 'reason', type: 'text', isNullable: true },
          { name: 'recommendedAction', type: 'varchar', length: '50', isNullable: true },
          { name: 'createdAt', type: 'timestamptz', default: 'now()' },
        ],
      }),
      true,
    );

    // ── Challenge Votes ────────────────────────────────────────────────
    await queryRunner.createTable(
      new Table({
        name: 'challenge_votes',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'challengeId', type: 'varchar', length: '128' },
          { name: 'userId', type: 'varchar', length: '128' },
          { name: 'value', type: 'varchar', length: '10' },
          { name: 'createdAt', type: 'timestamptz', default: 'now()' },
        ],
      }),
      true,
    );
    await queryRunner.createIndex(
      'challenge_votes',
      new TableIndex({ columnNames: ['challengeId', 'userId'], isUnique: true }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('challenge_votes');
    await queryRunner.dropTable('submission_analyses');
    await queryRunner.dropTable('social_posts');
    await queryRunner.dropTable('prize_pools');
    await queryRunner.dropTable('user_xp');
    await queryRunner.dropTable('wallets');
  }
}
