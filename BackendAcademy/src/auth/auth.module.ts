import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtLearnerGuard } from './guards/jwt-learner.guard';
import { JwtTutorGuard } from './guards/jwt-tutor.guard';
import { JwtAdminGuard } from './guards/jwt-admin.guard';
import { RolesGuard } from './guards/roles.guard';
import { DevAuthGuard } from './guards/dev-auth.guard';
import { AuthSessionService } from './auth-session.service';
import { AuthSessionController } from './auth-session.controller';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        const secret = config.get<string>('JWT_SECRET');
        if (!secret) {
          throw new Error(
            'JWT_SECRET is required. Set it in your environment variables. ' +
              'Generate a secure random string: openssl rand -hex 64',
          );
        }
        return {
          secret,
          signOptions: { expiresIn: '15m' },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthSessionController],
  providers: [
    JwtLearnerGuard,
    JwtTutorGuard,
    JwtAdminGuard,
    RolesGuard,
    AuthSessionService,
  ],
  exports: [
    JwtModule,
    DevAuthGuard,
    JwtLearnerGuard,
    JwtTutorGuard,
    JwtAdminGuard,
    RolesGuard,
    AuthSessionService,
  ],
})
export class AuthModule {}
