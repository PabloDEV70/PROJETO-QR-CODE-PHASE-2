import {
  CanActivate, ExecutionContext, Injectable,
  UnauthorizedException, ForbiddenException, Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { createHash, timingSafeEqual } from 'node:crypto';
import { getEnv } from '../../config/env';

export const API_DOMAIN_KEY = 'api_domain';
export const ApiDomain = (domain: string) =>
  (target: any, key?: string, descriptor?: any) => {
    Reflect.defineMetadata(API_DOMAIN_KEY, domain, descriptor?.value ?? target);
    return descriptor ?? target;
  };

interface ApiTokenEntry {
  appName: string;
  tokenHash: string;
  domains: string[];
}

function parseApiTokens(raw: string): ApiTokenEntry[] {
  if (!raw.trim()) return [];
  return raw.split(',').map((entry) => {
    const [appName, token, ...domains] = entry.split(':');
    return {
      appName: appName.trim(),
      tokenHash: createHash('sha256').update(token.trim()).digest('hex'),
      domains: domains.length > 0 ? domains.map((d) => d.trim()) : ['*'],
    };
  });
}

@Injectable()
export class ApiKeyGuard implements CanActivate {
  private readonly logger = new Logger(ApiKeyGuard.name);
  private tokens: ApiTokenEntry[] = [];
  private loaded = false;

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    if (!this.loaded) {
      this.tokens = parseApiTokens(getEnv().API_TOKENS);
      this.loaded = true;
    }

    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'] as string;

    if (!apiKey) {
      throw new UnauthorizedException('API key required (X-Api-Key header)');
    }

    const keyHash = createHash('sha256').update(apiKey).digest('hex');
    const entry = this.tokens.find((t) => {
      try {
        return timingSafeEqual(Buffer.from(t.tokenHash), Buffer.from(keyHash));
      } catch {
        return false;
      }
    });

    if (!entry) {
      this.logger.warn(`Invalid API key attempt from ${request.ip}`);
      throw new UnauthorizedException('Invalid API key');
    }

    // Check domain permission
    const domain = this.reflector.get<string>(API_DOMAIN_KEY, context.getHandler())
      ?? this.reflector.get<string>(API_DOMAIN_KEY, context.getClass());

    if (domain && !entry.domains.includes('*') && !entry.domains.includes(domain)) {
      throw new ForbiddenException(`App "${entry.appName}" not authorized for domain "${domain}"`);
    }

    request.apiApp = entry.appName;
    return true;
  }
}
