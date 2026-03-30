import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

export interface TokenPayload {
  username: string;
  sub: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class TokenService {
  private readonly ACCESS_TOKEN_EXPIRATION: string;
  private readonly REFRESH_TOKEN_EXPIRATION: string;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.ACCESS_TOKEN_EXPIRATION = this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRATION') || '1h';
    this.REFRESH_TOKEN_EXPIRATION = this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRATION') || '7d';
  }

  generateAccessToken(payload: { username: string; sub: number; codgrupo?: number }): string {
    return this.jwtService.sign(payload, { expiresIn: this.ACCESS_TOKEN_EXPIRATION as any });
  }

  generateRefreshToken(payload: { username: string; sub: number; codgrupo?: number }): string {
    return this.jwtService.sign(payload, { expiresIn: this.REFRESH_TOKEN_EXPIRATION as any });
  }

  verifyToken(token: string): TokenPayload {
    return this.jwtService.verify(token);
  }

  decodeToken(token: string): TokenPayload | null {
    try {
      return this.jwtService.decode(token);
    } catch {
      return null;
    }
  }

  extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }

  isTokenExpired(token: string): boolean {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded) return true;

      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp ? decoded.exp < currentTime : false;
    } catch {
      return true;
    }
  }

  getTokenExpiration(token: string): Date | null {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded || !decoded.exp) return null;
      return new Date(decoded.exp * 1000);
    } catch {
      return null;
    }
  }
}
