import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TokenService, TokenPayload } from './token.service';
import { UserValidationService, UserDetails } from './user-validation.service';
import { StructuredLogger } from '../../../common/logging/structured-logger.service';
import { AuthResponseDto } from '../dto/auth-response.dto'; // Import AuthResponseDto

@Injectable()
export class AuthService {
  constructor(
    private readonly tokenService: TokenService,
    private readonly userValidationService: UserValidationService,
    private readonly configService: ConfigService,
    private readonly logger: StructuredLogger,
  ) {}

  async login(username: string, password: string, ip?: string): Promise<AuthResponseDto> {
    try {
      this.logger.debug('Attempting login', { username, ip });

      const result = await this.userValidationService.validateUser(username, password);

      if (!result.success) {
        this.logger.info('Auth attempt', { username, success: false, ip }); // Log failed login
        throw new UnauthorizedException('Invalid credentials');
      }

      const payload = {
        username: result.user.NOMEUSU,
        sub: result.user.CODUSU,
      };

      const accessToken = this.tokenService.generateAccessToken(payload);
      const refreshToken = this.tokenService.generateRefreshToken(payload);
      const expiresIn = this.tokenService.getTokenExpiration(accessToken)?.getTime() / 1000 - Date.now() / 1000;

      this.logger.info('Auth attempt', { username, success: true, ip }); // Log successful login
      return {
        access_token: accessToken,
        refreshToken: refreshToken,
        tokenType: 'Bearer',
        expiresIn: Math.floor(expiresIn > 0 ? expiresIn : 0),
      };
    } catch (error) {
      // The error might be an UnauthorizedException already, or other errors.
      // Log as failed if it's not already handled as success
      if (!(error instanceof UnauthorizedException)) {
        this.logger.info('Auth attempt', { username, success: false, ip });
      }
      this.logger.error('Login failed', error as Error, { username, ip });
      throw error;
    }
  }

  async refreshTokens(token: string, ip?: string): Promise<AuthResponseDto> {
    try {
      const decodedRefreshToken = this.tokenService.verifyToken(token);

      if (!decodedRefreshToken) {
        this.logger.info('Auth attempt', { username: decodedRefreshToken?.username || 'unknown', success: false, ip }); // Log failed refresh
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Check if refresh token is expired
      if (this.tokenService.isTokenExpired(token)) {
        this.logger.info('Auth attempt', { username: decodedRefreshToken.username, success: false, ip }); // Log failed refresh
        throw new UnauthorizedException('Expired refresh token');
      }

      const payload = {
        username: decodedRefreshToken.username,
        sub: parseInt(decodedRefreshToken.sub),
      };

      const accessToken = this.tokenService.generateAccessToken(payload);
      const newRefreshToken = this.tokenService.generateRefreshToken(payload); // Issue a new refresh token (rotation)
      const expiresIn = this.tokenService.getTokenExpiration(accessToken)?.getTime() / 1000 - Date.now() / 1000;

      this.logger.info('Auth attempt', { username: payload.username, success: true, ip }); // Log successful refresh
      return {
        access_token: accessToken,
        refreshToken: newRefreshToken,
        tokenType: 'Bearer',
        expiresIn: Math.floor(expiresIn > 0 ? expiresIn : 0),
      };
    } catch (error) {
      this.logger.info('Auth attempt', { username: 'unknown', success: false, ip }); // Log failed refresh unconditionally
      this.logger.error('Token refresh failed', error as Error, { ip });
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async getUserDetails(userId: string): Promise<UserDetails> {
    try {
      const user = await this.userValidationService.getUserDetails(userId);

      if (!user) {
        this.logger.warn('User not found in getUserDetails', { userId });
        throw new UnauthorizedException('User not found');
      }

      this.logger.debug('User details retrieved', { userId });
      return user;
    } catch (error) {
      this.logger.error('Failed to get user details', error as Error, { userId });
      throw error;
    }
  }

  async validateToken(token: string): Promise<TokenPayload | null> {
    try {
      const payload = this.tokenService.verifyToken(token);

      if (this.tokenService.isTokenExpired(token)) {
        this.logger.warn('Expired token used', {
          username: payload.username,
          userId: payload.sub,
        });
        return null;
      }

      return payload;
    } catch (error) {
      this.logger.error('Token validation failed', error as Error);
      return null;
    }
  }

  extractTokenFromHeader(authHeader: string | undefined): string | null {
    try {
      const token = this.tokenService.extractTokenFromHeader(authHeader);

      if (!token) {
        this.logger.warn('Invalid authorization header format');
        return null;
      }

      return token;
    } catch (error) {
      this.logger.error('Failed to extract token from header', error as Error);
      return null;
    }
  }

  // REMOVED: updateLastLogin - This API is READ-ONLY
  // No database modifications allowed without explicit authorization
  // Only TESTE database allows write operations per security policy

  getJwtSecret(): string {
    const secret = this.configService.get<string>('JWT_SECRET');
    if (!secret) {
      this.logger.error('JWT_SECRET not configured');
      throw new Error('JWT_SECRET environment variable is required');
    }
    return secret;
  }

  isDevelopmentEnvironment(): boolean {
    const env = this.configService.get<string>('NODE_ENV') || this.configService.get<string>('ENVIRONMENT');
    return env !== 'production';
  }
}
