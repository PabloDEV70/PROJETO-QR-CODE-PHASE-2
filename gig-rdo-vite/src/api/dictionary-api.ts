import { apiMotherClient } from '@/api/api-mother-client';
import { unwrap, esc } from '@/api/api-helpers';
import type {
  TabelaDicionario, CampoDicionario, FieldOption,
  TableInstance, DictFieldSearchResult, FieldTypesMap, TableTrigger,
} from '@/types/database-types';

type R = Record<string, unknown>;

async function queryRows(sql: string): Promise<R[]> {
  const { data } = await apiMotherClient.post('/inspection/query', { query: sql });
  return (unwrap(data) as R[]) ?? [];
}

// ── Tables listing (via /dictionary/tables — works, has pagination) ──
export async function getDictionaryTables(): Promise<TabelaDicionario[]> {
  const { data } = await apiMotherClient.get('/dictionary/tables', {
    params: { limit: 10000 },
  });
  const inner = unwrap(data);
  const rows = (Array.isArray(inner) ? inner : (inner as R)?.data) as R[] ?? [];
  return rows.map((r) => ({
    nomeTabela: String(r.NOMETAB ?? ''),
    descricao: String(r.DESCRTAB ?? ''),
    tipoNumeracao: r.TIPONUMERACAO ? String(r.TIPONUMERACAO) : undefined,
    adicional: r.ADICIONAL ? String(r.ADICIONAL) : undefined,
  }));
}

// ── Table search (server-side via /dictionary/tables/search) ──
export async function searchDictionaryTables(
  term: string,
): Promise<TabelaDicionario[]> {
  const { data } = await apiMotherClient.get(
    `/dictionary/tables/search/${encodeURIComponent(term)}`,
  );
  const inner = unwrap(data);
  const rows = (Array.isArray(inner) ? inner : (inner as R)?.data) as R[] ?? [];
  return rows.map((r) => ({
    nomeTabela: String(r.NOMETAB ?? ''),
    descricao: String(r.DESCRTAB ?? ''),
  }));
}

// ── Rich field listing with PK/FK in ONE query (eliminates 2 extra API calls) ──
export async function getDictionaryTableFields(
  tableName: string,
): Promise<CampoDicionario[]> {
  const t = esc(tableName);
  const rows = await queryRows(
    `SELECT c.NUCAMPO, c.NOMECAMPO, c.DESCRCAMPO, c.TIPCAMPO, c.TAMANHO,`
    + ` c.TIPOAPRESENTACAO, c.MASCARA, c.PERMITEPESQUISA, c.CALCULADO, c.ORDEM,`
    + ` c.SISTEMA, c.ADICIONAL, c.EXPRESSAO, c.PERMITEPADRAO, c.VISIVELGRIDPESQUISA,`
    + ` c.CONTROLE, c.DOMAIN,`
    + ` (SELECT COUNT(*) FROM TDDOPC o WHERE o.NUCAMPO = c.NUCAMPO) AS QTD_OPCOES,`
    + ` CASE WHEN pk.COLUMN_NAME IS NOT NULL THEN 1 ELSE 0 END AS IS_PK,`
    + ` fk.ref_table AS FK_TABLE`
    + ` FROM TDDCAM c`
    + ` LEFT JOIN (`
    + `   SELECT ku.COLUMN_NAME`
    + `   FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE ku`
    + `   JOIN INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc`
    + `     ON ku.CONSTRAINT_NAME = tc.CONSTRAINT_NAME`
    + `   WHERE tc.TABLE_NAME = '${t}' AND tc.CONSTRAINT_TYPE = 'PRIMARY KEY'`
    + ` ) pk ON pk.COLUMN_NAME = c.NOMECAMPO`
    + ` OUTER APPLY (`
    + `   SELECT TOP 1 OBJECT_NAME(fkc.referenced_object_id) AS ref_table`
    + `   FROM sys.foreign_key_columns fkc`
    + `   WHERE fkc.parent_object_id = OBJECT_ID('${t}')`
    + `   AND COL_NAME(fkc.parent_object_id, fkc.parent_column_id) = c.NOMECAMPO`
    + ` ) fk`
    + ` WHERE c.NOMETAB = '${t}'`
    + ` ORDER BY c.ORDEM, c.NOMECAMPO`,
  );
  return rows.map((r) => ({
    nucampo: Number(r.NUCAMPO ?? 0),
    nomeCampo: String(r.NOMECAMPO ?? ''),
    descricao: String(r.DESCRCAMPO ?? ''),
    tipo: String(r.TIPCAMPO ?? ''),
    tamanho: r.TAMANHO != null ? Number(r.TAMANHO) : null,
    tipoapresentacao: r.TIPOAPRESENTACAO ? String(r.TIPOAPRESENTACAO) : null,
    mascara: r.MASCARA ? String(r.MASCARA) : null,
    permitePesquisa: String(r.PERMITEPESQUISA) === 'S',
    calculado: String(r.CALCULADO) === 'S',
    ordem: Number(r.ORDEM ?? 0),
    sistema: String(r.SISTEMA) === 'S',
    adicional: String(r.ADICIONAL) === 'S',
    expressao: r.EXPRESSAO ? String(r.EXPRESSAO) : null,
    permitepadrao: String(r.PERMITEPADRAO) === 'S',
    visivelgridpesquisa: String(r.VISIVELGRIDPESQUISA) === 'S',
    controle: r.CONTROLE ? String(r.CONTROLE) : null,
    domain: r.DOMAIN ? String(r.DOMAIN) : null,
    qtdOpcoes: Number(r.QTD_OPCOES ?? 0),
    isPk: Number(r.IS_PK) === 1,
    fkTable: r.FK_TABLE ? String(r.FK_TABLE) : null,
  }));
}

// ── Cross-table field search (via /dictionary/fields/search) ──
export async function searchDictionaryFields(
  term: string,
): Promise<DictFieldSearchResult[]> {
  const { data } = await apiMotherClient.get(
    `/dictionary/fields/search/${encodeURIComponent(term)}`,
  );
  const inner = unwrap(data);
  const rows = (Array.isArray(inner) ? inner : (inner as R)?.data) as R[] ?? [];
  return rows.map((r) => ({
    nucampo: Number(r.NUCAMPO ?? 0),
    nomeTabela: String(r.NOMETAB ?? ''),
    nomeCampo: String(r.NOMECAMPO ?? ''),
    descricao: String(r.DESCRCAMPO ?? ''),
    tipo: String(r.TIPCAMPO ?? ''),
    tipoapresentacao: String(r.TIPOAPRESENTACAO ?? 'P'),
    descricaoTabela: String(r.DESCRTABELA ?? ''),
  }));
}

// ── Field options (dropdown values from TDDOPC) ──
export async function getFieldOptions(nucampo: number): Promise<FieldOption[]> {
  const { data } = await apiMotherClient.get(
    `/dictionary/options/by-nucampo/${nucampo}`,
  );
  const inner = unwrap(data) as R | null;
  const rows = (inner?.options as R[]) ?? [];
  return rows.map((r) => ({
    valor: String(r.VALOR ?? r.valor ?? ''),
    opcao: String(r.OPCAO ?? r.opcao ?? ''),
    padrao: String(r.PADRAO ?? r.padrao ?? '') === 'S',
  }));
}

// ── Table instances/screens (via direct SQL on TDDINS) ──
export async function getTableInstances(
  tableName: string,
): Promise<TableInstance[]> {
  const rows = await queryRows(
    `SELECT NUINSTANCIA, NOMEINSTANCIA, DESCRINSTANCIA, ATIVO`
    + ` FROM TDDINS WHERE NOMETAB = '${esc(tableName)}' ORDER BY NOMEINSTANCIA`,
  );
  return rows.map((r) => ({
    nuinstancia: Number(r.NUINSTANCIA ?? 0),
    nomeInstancia: String(r.NOMEINSTANCIA ?? ''),
    descricao: String(r.DESCRINSTANCIA ?? ''),
    ativo: String(r.ATIVO) === 'S',
  }));
}

// ── Triggers for a specific table (via sys.triggers + sys.trigger_events) ──
export async function getTableTriggers(
  tableName: string,
): Promise<TableTrigger[]> {
  const rows = await queryRows(
    `SELECT t.name AS nome,`
    + ` CASE WHEN t.is_instead_of_trigger = 1 THEN 'INSTEAD OF' ELSE 'AFTER' END AS tipo,`
    + ` STUFF((SELECT ',' + te.type_desc FROM sys.trigger_events te`
    + ` WHERE te.object_id = t.object_id FOR XML PATH('')), 1, 1, '') AS eventos,`
    + ` CASE WHEN t.is_disabled = 1 THEN 0 ELSE 1 END AS ativo,`
    + ` OBJECT_DEFINITION(t.object_id) AS definicao,`
    + ` t.create_date AS dataCriacao, t.modify_date AS dataModificacao`
    + ` FROM sys.triggers t`
    + ` WHERE t.parent_id = OBJECT_ID('${esc(tableName)}')`
    + ` ORDER BY t.name`,
  );
  return rows.map((r) => ({
    nome: String(r.nome ?? ''),
    tipo: String(r.tipo ?? 'AFTER'),
    eventos: String(r.eventos ?? ''),
    ativo: Number(r.ativo) === 1,
    definicao: String(r.definicao ?? ''),
    dataCriacao: String(r.dataCriacao ?? ''),
    dataModificacao: String(r.dataModificacao ?? ''),
  }));
}

// ── Meta (field type labels + presentation types) ──
export async function getFieldTypesMeta(): Promise<FieldTypesMap> {
  const { data } = await apiMotherClient.get('/dictionary/meta/field-types');
  return ((unwrap(data) as R)?.types as FieldTypesMap) ?? {};
}

export async function getPresentationTypesMeta(): Promise<FieldTypesMap> {
  const { data } = await apiMotherClient.get(
    '/dictionary/meta/presentation-types',
  );
  return ((unwrap(data) as R)?.types as FieldTypesMap) ?? {};
}
