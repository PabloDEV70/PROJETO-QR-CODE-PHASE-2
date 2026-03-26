import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { getEnv } from '../../config/env';

export interface JwtPayload {
  codusu: number;
  username: string;
  database?: string;
  sub?: number;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: getEnv().JWT_SECRET,
    });
  }

  validate(payload: JwtPayload) {
    return {
      codusu: payload.codusu ?? payload.sub,
      username: payload.username,
      database: payload.database,
    };
  }
}
