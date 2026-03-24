import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DatabaseCredentials,
  DatabaseUserType,
  selectCredentials,
  getCRUDCredentials,
  getSACredentials,
  isSAUserEnabled,
  isSAUserEnabledFor,
} from '../config/credentials.config';

/**
 * Service para gerenciar credenciais de banco de dados
 *
 * Responsabilidades:
 * 1. Selecionar credenciais baseado no tipo de operação (CRUD vs SA)
 * 2. Validar se SA user está habilitado
 * 3. Injetar dependências com as credenciais corretas
 * 4. Logar uso de SA user (auditoria)
 *
 * Clean Architecture:
 * - Centraliza lógica de credenciais em um único lugar
 * - Injeção de dependência via NestJS
 * - Separação clara entre CRUD e SA
 * - Configurável via environment variables
 *
 * @example
 * // Usar credenciais CRUD (padrão)
 * const crudCreds = this.credentialsService.getCRUDCredentials();
 *
 * @example
 * // Usar credenciais SA (especial)
 * const saCreds = this.credentialsService.getSACredentials();
 */
@Injectable()
export class DatabaseCredentialsService {
  private readonly logger = new Logger(DatabaseCredentialsService.name);

  constructor(private readonly configService: ConfigService) {
    this.logConfiguration();
  }

  /**
   * Obter credenciais CRUD (padrão)
   *
   * Usadas em operações normais: SELECT, INSERT, UPDATE, DELETE, PATCH
   *
   * @returns Credenciais do usuário CRUD
   */
  getCRUDCredentials(): DatabaseCredentials {
    this.logger.debug('Using CRUD credentials');
    return getCRUDCredentials(this.configService);
  }

  /**
   * Obter credenciais SA (especial)
   *
   * Usadas APENAS em operações especiais: Triggers, Procedures, System Queries
   * Requer ENABLE_SA_USER=true
   *
   * @returns Credenciais do usuário SA
   * @throws Error se SA user não está habilitado
   */
  getSACredentials(): DatabaseCredentials {
    if (!isSAUserEnabled(this.configService)) {
      const error = 'SA user is not enabled. Set ENABLE_SA_USER=true in environment variables.';
      this.logger.error(error);
      throw new Error(error);
    }

    this.logger.warn('Using SA credentials - This should be RARE and logged for audit');
    return getSACredentials(this.configService);
  }

  /**
   * Obter credenciais baseado no tipo de usuário
   *
   * @param userType - Tipo de usuário (CRUD ou SA)
   * @returns Credenciais apropriadas
   */
  getCredentials(userType: DatabaseUserType): DatabaseCredentials {
    return selectCredentials(userType, this.configService);
  }

  /**
   * Obter credenciais para uma operação específica
   *
   * Se a operação requer SA user e está habilitada, usa SA.
   * Caso contrário, usa CRUD.
   *
   * @param operation - Tipo de operação (TRIGGERS, PROCEDURES, etc)
   * @returns Credenciais apropriadas
   */
  getCredentialsForOperation(
    operation: 'TRIGGERS' | 'PROCEDURES' | 'VIEWS' | 'FUNCTIONS' | 'CRUD',
  ): DatabaseCredentials {
    if (operation === 'CRUD') {
      return this.getCRUDCredentials();
    }

    if (isSAUserEnabledFor(operation, this.configService)) {
      this.logger.warn(`Using SA credentials for operation: ${operation}`);
      return this.getSACredentials();
    }

    this.logger.debug(`Using CRUD credentials for operation: ${operation} (SA not enabled for this operation)`);
    return this.getCRUDCredentials();
  }

  /**
   * Verificar se SA user está habilitado
   *
   * @returns true se SA user está habilitado
   */
  isSAEnabled(): boolean {
    return isSAUserEnabled(this.configService);
  }

  /**
   * Verificar se SA user está habilitado para uma operação específica
   *
   * @param operation - Tipo de operação
   * @returns true se SA user está habilitado para esta operação
   */
  isSAEnabledFor(operation: 'TRIGGERS' | 'PROCEDURES' | 'VIEWS' | 'FUNCTIONS'): boolean {
    return isSAUserEnabledFor(operation, this.configService);
  }

  /**
   * Log de configuração inicial (apenas uma vez ao inicializar)
   *
   * Mostra status de credenciais para debug
   */
  private logConfiguration(): void {
    const server = this.configService.get<string>('SQLSERVER_SERVER', 'localhost');
    const database = this.configService.get<string>('SQLSERVER_DATABASE', 'SANKHYA_TREINA');
    const saEnabled = isSAUserEnabled(this.configService);

    this.logger.log(`Database Configuration:`);
    this.logger.log(`  Server: ${server}`);
    this.logger.log(`  Database: ${database}`);
    this.logger.log(`  SA User: ${saEnabled ? 'ENABLED' : 'DISABLED'}`);

    if (saEnabled) {
      const saTriggersEnabled = isSAUserEnabledFor('TRIGGERS', this.configService);
      const saProceduresEnabled = isSAUserEnabledFor('PROCEDURES', this.configService);
      this.logger.warn(`  SA for TRIGGERS: ${saTriggersEnabled}`);
      this.logger.warn(`  SA for PROCEDURES: ${saProceduresEnabled}`);
    }
  }
}
