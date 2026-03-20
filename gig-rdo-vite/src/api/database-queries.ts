import { apiMotherClient } from '@/api/api-mother-client';
import { unwrap, unwrapDb, esc } from '@/api/api-helpers';
import type {
  DbQueryResult,
  QueryAtiva,
  EstatisticasQuery,
  SessaoAtiva,
  VisaoServidor,
  EstatisticaEspera,
} from '@/types/database-types';

export { unwrap, unwrapDb, esc };

export async function queryRows(sql: string): Promise<Record<string, unknown>[]> {
  const { data } = await apiMotherClient.post('/inspection/query', { query: sql });
  return (unwrap(data) as Record<string, unknown>[]) ?? [];
}

// ── Query ──────────────────────────────────────────────
export async function executeQuery(sql: string): Promise<DbQueryResult> {
  const start = performance.now();
  const { data } = await apiMotherClient.post('/inspection/query', { query: sql });
  const rows = (unwrap(data) as Record<string, unknown>[]) ?? [];
  return {
    linhas: rows,
    quantidadeLinhas: rows.length,
    tempoExecucaoMs: Math.round(performance.now() - start),
  };
}

// ── Monitor ────────────────────────────────────────────
export async function getQueriesAtivas(): Promise<QueryAtiva[]> {
  const { data } = await apiMotherClient.get('/monitoring/queries-ativas');
  return (unwrap(data) as QueryAtiva[]) ?? [];
}

export async function getQueriesPesadas(
  params?: { limite?: number; cpuMinimo?: number },
): Promise<EstatisticasQuery[]> {
  const { data } = await apiMotherClient.get('/monitoring/queries-pesadas', { params });
  return (unwrap(data) as EstatisticasQuery[]) ?? [];
}

export async function getEstatisticasQuery(
  params?: { limite?: number },
): Promise<EstatisticasQuery[]> {
  const { data } = await apiMotherClient.get('/monitoring/estatisticas-query', { params });
  return (unwrap(data) as EstatisticasQuery[]) ?? [];
}

export async function getSessoes(): Promise<SessaoAtiva[]> {
  const { data } = await apiMotherClient.get('/monitoring/sessoes');
  return (unwrap(data) as SessaoAtiva[]) ?? [];
}

export async function getVisaoServidor(): Promise<VisaoServidor> {
  const { data } = await apiMotherClient.get('/monitoring/visao-servidor');
  return (unwrap(data) as VisaoServidor) ?? {};
}

export async function getEstatisticasEspera(
  params?: { limite?: number },
): Promise<EstatisticaEspera[]> {
  const { data } = await apiMotherClient.get('/monitoring/estatisticas-espera', { params });
  return (unwrap(data) as EstatisticaEspera[]) ?? [];
}
