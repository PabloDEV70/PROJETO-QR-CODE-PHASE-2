/**
 * Database Credentials Configuration
 *
 * Separates CRUD operations (standard user) from special operations (SA user)
 * using Clean Architecture and environment-based injection.
 *
 * CRUD USER (Operações padrão):
 * - Username: sankhya
 * - Password: 12gig23 (via SQLSERVER_CRUD_PASSWORD env var)
 * - Usado em: SANKHYA_PROD, SANKHYA_TESTE, SANKHYA_TREINA
 * - Permissões: SELECT, INSERT, UPDATE, DELETE, PATCH
 *
 * SA USER (Operações especiais):
 * - Username: sa
 * - Password: (via SQLSERVER_SA_PASSWORD env var)
 * - Usado APENAS em: Triggers, Procedures, System Queries
 * - Ativado por: Feature flag ENABLE_SA_USER ou ENABLE_SA_FOR_[OPERATION]
 * - NUNCA para CRUD normal
 *
 * @see DatabaseConnectionService - Injeta credenciais baseado em contexto
 * @see DATABASE_CREDENTIALS_CRUD - Configuração padrão
 * @see DATABASE_CREDENTIALS_SA - Configuração especial
 */

export interface DatabaseCredentials {
  username: string;
  password: string;
  server: string;
  database: string;
  port: number;
  encrypt?: boolean;
  trustServerCertificate?: boolean;
}

export interface DatabaseCredentialsConfig {
  crud: DatabaseCredentials;
  sa: DatabaseCredentials;
}

/**
 * Tipos de usuário para injeção de dependência
 */
export enum DatabaseUserType {
  /**
   * Usuário padrão para operações CRUD
   * - SELECT, INSERT, UPDATE, DELETE, PATCH
   * - Username: sankhya
   * - Todas as operações normais
   */
  CRUD = 'crud',

  /**
   * Usuário SA para operações especiais
   * - Triggers, Procedures, System Queries
   * - Username: sa
   * - Ativado APENAS se ENABLE_SA_USER=true
   */
  SA = 'sa',
}

/**
 * Get CRUD credentials (standard user for SELECT/INSERT/UPDATE/DELETE/PATCH)
 *
 * @param configService - NestJS ConfigService
 * @returns Credenciais do usuário CRUD
 */
export function getCRUDCredentials(configService: any): DatabaseCredentials {
  const server = (configService.get('SQLSERVER_SERVER') as string) || 'localhost';
  const port = (configService.get('SQLSERVER_PORT') as number) || 1433;
  const password =
    (configService.get('SQLSERVER_CRUD_PASSWORD') as string) ||
    (configService.get('SQLSERVER_PASSWORD') as string) ||
    '12gig23';

  return {
    username: 'sankhya',
    password,
    server,
    port,
    database: (configService.get('SQLSERVER_DATABASE') as string) || 'SANKHYA_TREINA',
    encrypt: (configService.get('SQLSERVER_ENCRYPT') as boolean) || false,
    trustServerCertificate: (configService.get('SQLSERVER_TRUST_SERVER_CERTIFICATE') as boolean) || true,
  };
}

/**
 * Get SA credentials (special operations only)
 *
 * IMPORTANTE: Verificar ENABLE_SA_USER antes de usar!
 *
 * @param configService - NestJS ConfigService
 * @returns Credenciais do usuário SA
 */
export function getSACredentials(configService: any): DatabaseCredentials {
  const server = (configService.get('SQLSERVER_SERVER') as string) || 'localhost';
  const port = (configService.get('SQLSERVER_PORT') as number) || 1433;
  const password =
    (configService.get('SQLSERVER_SA_PASSWORD') as string) || (configService.get('SQLSERVER_PASSWORD') as string) || '';

  if (!password) {
    throw new Error('SQLSERVER_SA_PASSWORD not configured. SA user cannot be used without explicit password.');
  }

  return {
    username: 'sa',
    password,
    server,
    port,
    database: (configService.get('SQLSERVER_DATABASE') as string) || 'SANKHYA_TREINA',
    encrypt: (configService.get('SQLSERVER_ENCRYPT') as boolean) || false,
    trustServerCertificate: (configService.get('SQLSERVER_TRUST_SERVER_CERTIFICATE') as boolean) || true,
  };
}

/**
 * Verifica se SA user está habilitado
 *
 * @param configService - NestJS ConfigService
 * @returns true se SA user está habilitado
 */
export function isSAUserEnabled(configService: any): boolean {
  const enabled = (configService.get('ENABLE_SA_USER') as string) || 'false';
  return enabled.toLowerCase() === 'true' || enabled === '1' || enabled === 'yes';
}

/**
 * Verifica se SA user está habilitado para uma operação específica
 *
 * @param operation - Operação (TRIGGERS, PROCEDURES, VIEWS, etc)
 * @param configService - NestJS ConfigService
 * @returns true se SA user está habilitado para esta operação
 */
export function isSAUserEnabledFor(
  operation: 'TRIGGERS' | 'PROCEDURES' | 'VIEWS' | 'FUNCTIONS',
  configService: any,
): boolean {
  const key = `ENABLE_SA_FOR_${operation}`;
  const enabled = (configService.get(key) as string) || 'false';
  return enabled.toLowerCase() === 'true' || enabled === '1' || enabled === 'yes';
}

/**
 * Seleciona credenciais baseado no tipo de usuário
 *
 * @param userType - Tipo de usuário (CRUD ou SA)
 * @param configService - NestJS ConfigService
 * @returns DatabaseCredentials
 */
export function selectCredentials(userType: DatabaseUserType, configService: any): DatabaseCredentials {
  if (userType === DatabaseUserType.SA) {
    if (!isSAUserEnabled(configService)) {
      throw new Error('SA user is not enabled. Set ENABLE_SA_USER=true in environment variables to use SA user.');
    }
    return getSACredentials(configService);
  }

  return getCRUDCredentials(configService);
}

/**
 * Configuração de credenciais por banco de dados
 *
 * Cada banco usa as mesmas credenciais CRUD
 */
export const DATABASE_CREDENTIALS_BY_DATABASE = {
  PROD: {
    server: 'prod-sql-server',
    database: 'SANKHYA_PROD',
  },
  TESTE: {
    server: 'test-sql-server',
    database: 'SANKHYA_TESTE',
  },
  TREINA: {
    server: 'training-sql-server',
    database: 'SANKHYA_TREINA',
  },
} as const;

/**
 * Resumo das credenciais
 */
export const CREDENTIALS_SUMMARY = `
╔════════════════════════════════════════════════════════════╗
║           DATABASE CREDENTIALS CONFIGURATION               ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║  CRUD USER (Padrão - Todas operações normais)             ║
║  ├─ Username: sankhya                                      ║
║  ├─ Password: (via SQLSERVER_CRUD_PASSWORD)               ║
║  ├─ Usado em: SELECT, INSERT, UPDATE, DELETE, PATCH       ║
║  └─ Bancos: PROD, TESTE, TREINA                           ║
║                                                            ║
║  SA USER (Especial - Operações via triggers/procedures)   ║
║  ├─ Username: sa                                           ║
║  ├─ Password: (via SQLSERVER_SA_PASSWORD)                 ║
║  ├─ Ativado por: ENABLE_SA_USER=true                      ║
║  ├─ Por operação: ENABLE_SA_FOR_TRIGGERS=true             ║
║  └─ ⚠️  NUNCA para CRUD normal                             ║
║                                                            ║
╠════════════════════════════════════════════════════════════╣
║                   ENVIRONMENT VARIABLES                    ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║  SQLSERVER_SERVER=localhost                               ║
║  SQLSERVER_PORT=1433                                       ║
║  SQLSERVER_DATABASE=SANKHYA_TREINA                         ║
║                                                            ║
║  # CRUD (padrão)                                          ║
║  SQLSERVER_CRUD_PASSWORD=12gig23                          ║
║                                                            ║
║  # SA (especial)                                          ║
║  SQLSERVER_SA_PASSWORD=sua-senha-sa                       ║
║  ENABLE_SA_USER=false (ou true para habilitar)            ║
║  ENABLE_SA_FOR_TRIGGERS=false                             ║
║  ENABLE_SA_FOR_PROCEDURES=false                           ║
║  ENABLE_SA_FOR_VIEWS=false                                ║
║  ENABLE_SA_FOR_FUNCTIONS=false                            ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
`;
