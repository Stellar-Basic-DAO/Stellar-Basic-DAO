/**
 * DevAuthGuard — Development-mode authentication guard
 *
 * **IMPORTANT: This guard is environment-gated and will THROW in production.**
 *
 * In development/NODE_ENV=test, this guard attaches a stub user and allows all
 * traffic through for rapid iteration.
 *
 * In production, this guard immediately throws a 500 error to prevent
 * accidentally shipping unprotected endpoints to production.
 *
 * All controllers using @UseGuards(DevAuthGuard) MUST be migrated to use
 * real JWT guards (JwtLearnerGuard, JwtAdminGuard, JwtTutorGuard) combined
 * with @Roles() decorator and RolesGuard before deployment.
 *
 * @deprecated Replace with JwtAdminGuard + @Roles() or appropriate JWT guard.
 *
 * @example
 * // Development (current — must be migrated):
 * @UseGuards(DevAuthGuard)  // ❌ Not safe for production
 *
 * // Production (target):
 * @UseGuards(JwtAdminGuard, RolesGuard)
 * @Roles(UserRole.ADMIN)
 */

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';

@Injectable()
export class DevAuthGuard implements CanActivate {
  private readonly logger = new Logger(DevAuthGuard.name);

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const handler = context.getHandler().name;
    const controller = context.getClass().name;
    const nodeEnv = process.env.NODE_ENV || 'production';

    // CRITICAL: Fail closed in production — never allow DevAuthGuard through
    if (nodeEnv === 'production') {
      this.logger.error(
        `[PRODUCTION] ${controller}.${handler} — DevAuthGuard is blocking access. ` +
          'This controller has not been migrated to real JWT auth guards. ' +
          'Replace @UseGuards(DevAuthGuard) with @UseGuards(JwtAdminGuard, RolesGuard) immediately.',
      );
      throw new InternalServerErrorException(
        'Authentication not configured for production. Contact the system administrator.',
      );
    }

    this.logger.warn(
      `[DEV] ${controller}.${handler} — DevAuthGuard is active. ` +
        'Replace with JwtAdminGuard / RolesGuard before production deployment. ' +
        `(NODE_ENV=${nodeEnv})`,
    );

    // In dev/test mode, attach a stub user for rapid iteration.
    // NOTE: stub role is 'admin' — bypasses all RBAC in development.
    // NEVER expose this to production traffic.
    request.user = { userId: 'dev-user', role: 'admin' };
    return true;
  }
}
