import { apiMotherClient } from '@/api/api-mother-client';
import type { TabelaInfo, ColunaSchema } from '@/types/database-types';
import { unwrap, unwrapDb, queryRows, esc } from '@/api/database-queries';

// ── Tables ─────────────────────────────────────────────
export async function getTables(): Promise<TabelaInfo[]> {
  const { data } = await apiMotherClient.get('/inspection/tables');
  const raw = unwrap(data) as Record<string, unknown> | null;
  return (raw?.tables as TabelaInfo[]) ?? [];
}

export async function getTableSchema(tableName: string): Promise<ColunaSchema[]> {
  const { data } = await apiMotherClient.get('/inspection/table-schema', {
    params: { tableName },
  });
  return (unwrap(data) as ColunaSchema[]) ?? [];
}

export async function getTableKeys(
  tableName: string,
): Promise<{ COLUMN_NAME: string }[]> {
  const { data } = await apiMotherClient.get(
    `/inspection/primary-keys/${encodeURIComponent(tableName)}`,
  );
  const raw = unwrap(data) as Record<string, unknown> | null;
  return (raw?.primaryKeys as { COLUMN_NAME: string }[]) ?? [];
}

// ── DB Objects ─────────────────────────────────────────
export async function getViews() {
  const { data } = await apiMotherClient.get('/database/views');
  return (unwrapDb(data) as unknown[]) ?? [];
}

export async function getViewDetalhe(schema: string, nome: string) {
  const { data } = await apiMotherClient.get(
    `/database/views/${encodeURIComponent(schema)}/${encodeURIComponent(nome)}`,
  );
  return unwrapDb(data) ?? { schema, nome, definicao: '' };
}

export async function getProcedures() {
  const { data } = await apiMotherClient.get('/database/procedures');
  return (unwrapDb(data) as unknown[]) ?? [];
}

export async function getProcedureDetalhe(schema: string, nome: string) {
  const { data } = await apiMotherClient.get(
    `/database/procedures/${encodeURIComponent(schema)}/${encodeURIComponent(nome)}`,
  );
  return unwrapDb(data) ?? { schema, nome, definicao: '' };
}

export async function getTriggers() {
  const { data } = await apiMotherClient.get('/database/triggers');
  return (unwrapDb(data) as unknown[]) ?? [];
}

export async function getTriggerDetalhe(schema: string, nome: string) {
  const { data } = await apiMotherClient.get(
    `/database/triggers/${encodeURIComponent(schema)}/${encodeURIComponent(nome)}`,
  );
  return unwrapDb(data) ?? { schema, nome, definicao: '' };
}

export async function getRelacionamentos() {
  const { data } = await apiMotherClient.get('/database/relacionamentos');
  return (unwrapDb(data) as unknown[]) ?? [];
}

// ── DB Resumo ─────────────────────────────────────────
export async function getDbResumo() {
  const { data } = await apiMotherClient.get('/database/resumo');
  return (unwrapDb(data) as Record<string, unknown>) ?? {};
}

// ── Table Relations (per table) ───────────────────────
export async function getTableRelations(tableName: string) {
  const { data } = await apiMotherClient.get('/inspection/table-relations', {
    params: { tableName },
  });
  const raw = unwrap(data) as Record<string, unknown> | null;
  return (raw?.relations as Record<string, unknown>[]) ?? [];
}

// ── Functions (via SQL on sys.objects) ────────────────
export async function getFunctions() {
  return queryRows(
    `SELECT SCHEMA_NAME(o.schema_id) AS [schema], o.name AS nome,`
    + ` o.type_desc AS tipoDescricao, o.create_date AS dataCriacao,`
    + ` o.modify_date AS dataModificacao`
    + ` FROM sys.objects o WHERE o.type IN ('FN','IF','TF') ORDER BY o.name`,
  );
}

export async function getFunctionDetalhe(schema: string, nome: string) {
  const [rows, params] = await Promise.all([
    queryRows(
      `SELECT SCHEMA_NAME(o.schema_id) AS [schema], o.name AS nome,`
      + ` o.type_desc AS tipoDescricao, o.create_date AS dataCriacao,`
      + ` o.modify_date AS dataModificacao, m.definition AS definicao`
      + ` FROM sys.objects o LEFT JOIN sys.sql_modules m ON m.object_id = o.object_id`
      + ` WHERE o.type IN ('FN','IF','TF')`
      + ` AND SCHEMA_NAME(o.schema_id) = '${esc(schema)}' AND o.name = '${esc(nome)}'`,
    ),
    queryRows(
      `SELECT p.name AS nome, TYPE_NAME(p.user_type_id) AS tipo,`
      + ` p.max_length AS tamanhoMaximo, p.is_output AS saida`
      + ` FROM sys.parameters p INNER JOIN sys.objects o ON o.object_id = p.object_id`
      + ` WHERE o.type IN ('FN','IF','TF')`
      + ` AND SCHEMA_NAME(o.schema_id) = '${esc(schema)}' AND o.name = '${esc(nome)}'`
      + ` AND p.parameter_id > 0 ORDER BY p.parameter_id`,
    ),
  ]);
  const base = rows[0] ?? { schema, nome, definicao: null };
  return { ...base, parametros: params };
}
