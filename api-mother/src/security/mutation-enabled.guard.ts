import { CanActivate, ExecutionContext, ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseContextService } from '../database/database-context.service';

/**
 * Guard que verifica se operações de mutação estão habilitadas para o ambiente.
 *
 * Controle via variáveis de ambiente:
 * - MUTATION_ENABLED_TESTE=true (padrão)
 * - MUTATION_ENABLED_TREINA=false (padrão)
 * - MUTATION_ENABLED_PROD=false (padrão)
 */
@Injectable()
export class MutationEnabledGuard implements CanActivate {
  private readonly logger = new Logger(MutationEnabledGuard.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly databaseContext: DatabaseContextService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const database = this.databaseContext.getCurrentDatabase() || request.headers['x-database'] || 'PROD';

    const isEnabled = this.isMutationEnabled(database);

    if (!isEnabled) {
      this.logger.warn(`Mutation blocked for database: ${database}`, {
        method: request.method,
        path: request.path,
        user: request.user?.username || 'unknown',
        ip: request.ip,
      });

      throw new ForbiddenException({
        message: `Operações de escrita estão desabilitadas para o ambiente ${database}`,
        code: 'MUTATION_DISABLED',
        database,
        hint: 'Operações de escrita só estão habilitadas para o ambiente TESTE',
      });
    }

    this.logger.debug(`Mutation allowed for database: ${database}`);
    return true;
  }

  private isMutationEnabled(database: string): boolean {
    const envKey = `MUTATION_ENABLED_${database.toUpperCase()}`;
    const value = this.configService.get<string>(envKey);

    // Se não configurado, usar padrões seguros
    if (value === undefined) {
      // TESTE habilitado por padrão, outros desabilitados
      return database.toUpperCase() === 'TESTE';
    }

    return value === 'true' || value === '1';
  }
}
