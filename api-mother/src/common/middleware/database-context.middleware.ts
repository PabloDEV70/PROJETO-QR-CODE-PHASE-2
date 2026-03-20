import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { DatabaseContextService } from '../../database/database-context.service';
import { DatabaseKey, isValidDatabaseKey, VALID_DATABASE_KEYS } from '../../config/database.config';
import { StructuredLogger } from '../logging/structured-logger.service';

@Injectable()
export class DatabaseContextMiddleware implements NestMiddleware {
  // Endpoints de health check que não devem gerar logs
  private readonly HEALTH_CHECK_ENDPOINTS = ['/', '/version', '/health', '/favicon.ico', '/api/health'];

  constructor(
    private readonly databaseContext: DatabaseContextService,
    private readonly logger: StructuredLogger,
  ) {}

  private isHealthCheck(url: string): boolean {
    return this.HEALTH_CHECK_ENDPOINTS.some((endpoint) => url === endpoint || url.startsWith(endpoint + '?'));
  }

  use(req: Request, res: Response, next: NextFunction): void {
    const headerValue = req.get('X-Database');

    // Health check endpoints don't require database context
    if (this.isHealthCheck(req.url)) {
      return next();
    }

    // X-Database header is mandatory for API endpoints
    if (!headerValue) {
      throw new BadRequestException({
        message: 'Header X-Database é obrigatório',
        error: 'MissingRequiredHeader',
        availableDatabases: VALID_DATABASE_KEYS,
        documentation:
          'Você deve especificar qual banco de dados deseja acessar usando o header X-Database. Opções válidas: PROD, TESTE, TREINA',
        example: 'X-Database: TESTE',
      });
    }

    if (!isValidDatabaseKey(headerValue)) {
      this.logger.warn('Invalid X-Database header', {
        value: headerValue,
        ip: req.ip,
        url: req.url,
      });
      throw new BadRequestException({
        message: `Header X-Database inválido: "${headerValue}"`,
        error: 'InvalidDatabaseKey',
        availableDatabases: VALID_DATABASE_KEYS,
        receivedValue: headerValue,
        documentation: 'O valor do header X-Database deve ser um dos bancos de dados válidos',
        example: 'X-Database: TESTE',
      });
    }

    const databaseKey: DatabaseKey = headerValue.toUpperCase() as DatabaseKey;

    // Attach to request object as fallback for async context loss
    (req as any).databaseKey = databaseKey;

    // Só loga se não for health check (reduz poluição de logs)
    if (!this.isHealthCheck(req.url)) {
      this.logger.debug('Database context set', {
        databaseKey,
        fromHeader: !!headerValue,
        url: req.url,
        ip: req.ip,
      });
    }

    this.databaseContext.run(databaseKey, () => {
      next();
    });
  }
}
