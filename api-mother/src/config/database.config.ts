import { ConfigService } from '@nestjs/config';

export type DatabaseKey = 'PROD' | 'TESTE' | 'TREINA';

export const VALID_DATABASE_KEYS: DatabaseKey[] = ['PROD', 'TESTE', 'TREINA'];
// IMPORTANTE: Default é TESTE para proteger dados de produção durante desenvolvimento
// Para acessar PROD, o cliente deve enviar header X-Database: PROD explicitamente
export const DEFAULT_DATABASE_KEY: DatabaseKey = 'TESTE';

export interface DatabaseConfig {
  server: string;
  user: string;
  password: string;
  database: string;
  encrypt?: boolean;
  trustServerCertificate?: boolean;
}

export function getDatabaseConfig(configService: ConfigService, key: DatabaseKey): DatabaseConfig {
  // Try new multi-database env vars first, fallback to legacy vars for PROD
  const server =
    configService.get<string>(`SQLSERVER_${key}_SERVER`) ||
    (key === 'PROD' ? configService.get<string>('SQLSERVER_SERVER') : undefined);

  const user =
    configService.get<string>(`SQLSERVER_${key}_USER`) ||
    (key === 'PROD' ? configService.get<string>('SQLSERVER_USER') : undefined);

  const password =
    configService.get<string>(`SQLSERVER_${key}_PASSWORD`) ||
    (key === 'PROD' ? configService.get<string>('SQLSERVER_PASSWORD') : undefined);

  const database =
    configService.get<string>(`SQLSERVER_${key}_DATABASE`) ||
    (key === 'PROD' ? configService.get<string>('SQLSERVER_DATABASE') : undefined);

  const encrypt = configService.get<string>('SQLSERVER_ENCRYPT') === 'true';
  const trustServerCertificate = configService.get<string>('SQLSERVER_TRUST_SERVER_CERTIFICATE') !== 'false';

  return { server, user, password, database, encrypt, trustServerCertificate };
}

export function isValidDatabaseKey(value: string): value is DatabaseKey {
  return VALID_DATABASE_KEYS.includes(value.toUpperCase() as DatabaseKey);
}

// ---------------------------------------------------------------------------
// Inspection Cache Config (Plan 09-02)
// ---------------------------------------------------------------------------

export interface InspectionCacheConfig {
  schemaTtlSeconds: number; // schema, PK, relations — default 30 min
  listTtlSeconds: number; // table listing — default 60 min
}

export function getInspectionCacheConfig(configService: ConfigService): InspectionCacheConfig {
  const parse = (val: string | undefined, def: number): number => {
    const n = parseInt(val ?? '', 10);
    return Number.isFinite(n) && n > 0 ? n : def;
  };
  return {
    schemaTtlSeconds: parse(
      configService.get<string>('CACHE_INSPECTION_SCHEMA_TTL_SECONDS'),
      1800, // 30 minutes
    ),
    listTtlSeconds: parse(
      configService.get<string>('CACHE_INSPECTION_LIST_TTL_SECONDS'),
      3600, // 60 minutes
    ),
  };
}

export interface DatabasePoolConfig {
  min: number;
  max: number;
  idleTimeoutMillis: number;
}

export function getDatabasePoolConfig(
  configService: ConfigService,
  key: DatabaseKey,
): DatabasePoolConfig {
  const parse = (val: string | undefined, def: number): number => {
    const n = parseInt(val ?? '', 10);
    return Number.isFinite(n) && n > 0 ? n : def;
  };
  return {
    min: parse(configService.get<string>(`SQLSERVER_${key}_POOL_MIN`), 2),
    max: parse(configService.get<string>(`SQLSERVER_${key}_POOL_MAX`), 10),
    idleTimeoutMillis: parse(configService.get<string>(`SQLSERVER_${key}_POOL_IDLE`), 30000),
  };
}
