import { getEnv } from './env';

export type DatabaseKey = 'PROD' | 'TESTE' | 'TREINA';

const DB_MAP: Record<DatabaseKey, string> = {
  PROD: 'SANKHYA_PROD',
  TESTE: 'SANKHYA_TESTE',
  TREINA: 'SANKHYA_TREINA',
};

export interface DatabaseConfig {
  server: string;
  port: number;
  user: string;
  password: string;
  database: string;
  encrypt: boolean;
  trustServerCertificate: boolean;
  pool: { min: number; max: number; idleTimeoutMillis: number };
  connectionTimeout: number;
  requestTimeout: number;
}

export function getDatabaseConfig(key: DatabaseKey): DatabaseConfig {
  const env = getEnv();
  return {
    server: env.SQLSERVER_HOST,
    port: env.SQLSERVER_PORT,
    user: env.SQLSERVER_USER,
    password: env.SQLSERVER_PASSWORD,
    database: DB_MAP[key],
    encrypt: env.SQLSERVER_ENCRYPT as unknown as boolean,
    trustServerCertificate: env.SQLSERVER_TRUST_CERT as unknown as boolean,
    pool: {
      min: env.SQLSERVER_POOL_MIN,
      max: env.SQLSERVER_POOL_MAX,
      idleTimeoutMillis: 30000,
    },
    connectionTimeout: 15000,
    requestTimeout: 30000,
  };
}
