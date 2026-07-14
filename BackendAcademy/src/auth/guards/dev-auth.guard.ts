/**
 * DevAuthGuard — Development-mode authentication guard
 *
 * In development, this guard LOGS a warning but ALLOWS all traffic through.
 * This lets developers iterate quickly without a running auth infrastructure.
 *
 * ── To enable real auth in production ─────────────────────────────────
 * 1. Replace `DevAuthGuard` with `JwtLearnerGuard`, `JwtAdminGuard`, or
 *    `JwtTutorGuard` from `../auth/guards/`.
 * 2. Combine with `RolesGuard` and `@Roles()` decorator for fine-grained RBAC.
 * 3. Ensure `AuthModule` is imported in the target feature's `@Module()`.
 *
 * @example
 * ```typescript
 * // Development:
 * @UseGuards(DevAuthGuard)
 *
 * // Production:
 * @UseGuards(JwtAdminGuard)
 * @Roles(UserRole.ADMIN)
 * ```
 *
 * TODO: Replace with JwtLearnerGuard / JwtAdminGuard before production launch.
 */

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';

@Injectable()
export class DevAuthGuard implements CanActivate {
  private readonly logger = new Logger(DevAuthGuard.name);

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const handler = context.getHandler().name;
    const controller = context.getClass().name;

    this.logger.warn(
      `[DEV] ${controller}.${handler} — No real auth guard attached. ` +
        'Allowing request through. Replace with JwtAdminGuard / RolesGuard before production.',
    );

    // In dev mode, attach a stub user so downstream guards (RolesGuard) don't fail.
    // NOTE: stub role is 'admin' — this bypasses all RBAC in development.
    // Remove or change this before production.
    request.user = { userId: 'dev-user', role: 'admin' };
    return true;
  }
}
