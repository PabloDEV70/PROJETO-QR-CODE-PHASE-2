import {
  Controller, Post, Body, Headers, BadRequestException,
  ForbiddenException, Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InspectionService } from '../modules/inspection/services/inspection.service';
import { Throttle } from '@nestjs/throttler';
import { timingSafeEqual } from 'crypto';

/**
 * Public query endpoint — no JWT required.
 * Authenticates via X-Api-Key header (shared secret).
 * Only SELECT queries are allowed.
 */
@Controller('public-query')
@Throttle({ default: { limit: 30, ttl: 60000 } })
export class PublicQueryController {
  private readonly logger = new Logger(PublicQueryController.name);
  private readonly apiKey: string;

  constructor(
    private readonly inspectionService: InspectionService,
    private readonly configService: ConfigService,
  ) {
    this.apiKey = this.configService.get<string>('PUBLIC_API_KEY', '');
    if (!this.apiKey) {
      this.logger.warn('PUBLIC_API_KEY not configured — public-query endpoint will reject all requests');
    }
  }

  @Post()
  async executePublicQuery(
    @Body() body: { query: string },
    @Headers('x-api-key') headerKey: string,
  ) {
    // Validate API key (constant-time comparison to prevent timing attacks)
    if (!this.apiKey || !headerKey || headerKey.length !== this.apiKey.length ||
        !timingSafeEqual(Buffer.from(headerKey), Buffer.from(this.apiKey))) {
      throw new ForbiddenException('Invalid or missing X-Api-Key');
    }

    const sql = body?.query?.trim();
    if (!sql) {
      throw new BadRequestException('Query is required');
    }

    // SECURITY: Only SELECT allowed (WITH must resolve to SELECT, block DML)
    const upper = sql.replace(/^--.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '').trim().toUpperCase();
    if (!upper.startsWith('SELECT') && !upper.startsWith('WITH')) {
      throw new ForbiddenException('Only SELECT queries are allowed on public endpoint');
    }

    // Block DML keywords anywhere in the query
    const dmlPattern = /\b(INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|TRUNCATE|EXEC|EXECUTE|MERGE)\b/i;
    if (dmlPattern.test(sql)) {
      throw new ForbiddenException('DML/DDL operations are not allowed on public endpoint');
    }

    try {
      const result = await this.inspectionService.executeQuery({ query: sql, params: [] });
      this.logger.log(`Public query OK — ${result.rowCount ?? 0} rows`);
      return {
        data: result.data,
        success: true,
        meta: { rows: result.rowCount ?? (result.data?.length ?? 0) },
      };
    } catch (error: any) {
      this.logger.error(`Public query FAIL: ${error.message}`);
      throw new BadRequestException({
        message: error.message || 'Query execution failed',
        code: 'QUERY_ERROR',
      });
    }
  }
}
