import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { ApiKeyGuard } from './api-key.guard';
import { getEnv } from '../../config/env';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: getEnv().JWT_SECRET,
        signOptions: { expiresIn: '8h' },
      }),
    }),
  ],
  providers: [JwtStrategy, ApiKeyGuard],
  exports: [PassportModule, JwtModule, ApiKeyGuard],
})
export class AuthModule {}
