import { Module } from '@nestjs/common';

/**
 * Root BackendAcademy bootstrap module.
 *
 * This module is intentionally minimal — it delegates all functionality
 * to the main NestJS application defined in `src/app.module.ts`.
 *
 * @see src/app.module.ts
 */
@Module({
  imports: [],
  controllers: [],
  providers: [],
})
export class AppModule {}
