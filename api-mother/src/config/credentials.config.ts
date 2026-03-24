/**
 * Database Credentials Configuration
 *
 * All credentials are loaded exclusively from environment variables.
 * See .env.example for required variables.
 *
 * @see DatabaseConnectionService - Injeta credenciais baseado em contexto
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
  /** Usuário padrão para operações CRUD */
  CRUD = 'crud',

  /** Usuário SA para operações especiais (requer ENABLE_SA_USER=true) */
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
    '';

  const username =
    (configService.get('SQLSERVER_CRUD_USER') as string) ||
    (configService.get('SQLSERVER_USER') as string) ||
    '';

  if (!username || !password) {
    throw new Error('SQLSERVER_CRUD_USER/SQLSERVER_USER and SQLSERVER_CRUD_PASSWORD/SQLSERVER_PASSWORD must be set in environment variables.');
  }

  return {
    username,
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
    (configService.get('SQLSERVER_SA_PASSWORD') as string) || '';
  const username =
    (configService.get('SQLSERVER_SA_USER') as string) || '';

  if (!username || !password) {
    throw new Error('SQLSERVER_SA_USER and SQLSERVER_SA_PASSWORD must be set in environment variables.');
  }

  return {
    username,
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
 * Servers e databases são carregados do .env
 */
export const DATABASE_CREDENTIALS_BY_DATABASE = {
  PROD: {
    server: process.env.SQLSERVER_PROD_SERVER || '',
    database: process.env.SQLSERVER_PROD_DATABASE || '',
  },
  TESTE: {
    server: process.env.SQLSERVER_TESTE_SERVER || '',
    database: process.env.SQLSERVER_TESTE_DATABASE || '',
  },
  TREINA: {
    server: process.env.SQLSERVER_TREINA_SERVER || '',
    database: process.env.SQLSERVER_TREINA_DATABASE || '',
  },
} as const;
