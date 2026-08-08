import { DataSource } from 'typeorm';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

/**
 * TypeORM DataSource configuration for running migrations and CLI commands.
 *
 * Uses DATABASE_URL environment variable for connection. Supports both
 * development (localhost) and production (Supabase/Cloud SQL) PostgreSQL.
 *
 * Usage:
 *   npx typeorm migration:run -d src/database/ormconfig.ts
 *   npx typeorm migration:generate src/database/migrations/NewMigration -d src/database/ormconfig.ts
 */
export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL || 'postgres://localhost:5432/backend_academy',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
  migrationsTableName: 'typeorm_migrations',
  synchronize: process.env.NODE_ENV !== 'production',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  logging: process.env.NODE_ENV === 'development',
});
