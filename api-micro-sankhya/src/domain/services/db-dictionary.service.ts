import { QueryExecutor } from '../../infra/api-mother/queryExecutor';
import { cache, CACHE_TTL, cacheKey } from '../../shared/cache';
import { escapeSqlIdentifier, escapeSqlString } from '../../shared/sql-sanitize';

const qe = new QueryExecutor();

interface DictTable {
  nomeTabela: string;
  descricao: string;
}

interface DictField {
  nomeCampo: string;
  descricao: string;
  tipo: string;
  tamanho: number | null;
  obrigatorio: boolean;
  chavePrimaria: boolean;
  chaveEstrangeira: boolean;
  tabelaReferencia: string | null;
}

export class DbDictionaryService {
  async getTables(): Promise<DictTable[]> {
    const key = 'dict:tables';
    const cached = cache.get<DictTable[]>(key);
    if (cached) return cached;

    const sql = `
      SELECT NOMETAB, DESCRTAB
      FROM TDDTAB
      ORDER BY NOMETAB`;
    const rows = await qe.executeQuery<{ NOMETAB: string; DESCRTAB: string }>(sql);
    const result = rows.map((r) => ({
      nomeTabela: r.NOMETAB ?? '',
      descricao: r.DESCRTAB ?? '',
    }));
    cache.set(key, result, CACHE_TTL.DICTIONARY);
    return result;
  }

  async getTableFields(tableName: string): Promise<DictField[]> {
    const key = cacheKey('dict:fields', { table: tableName });
    const cached = cache.get<DictField[]>(key);
    if (cached) return cached;

    const safe = escapeSqlIdentifier(tableName);
    const sql = `
      SELECT
        c.NOMECAMPO,
        c.DESCRCAMPO,
        c.TIPCAMPO,
        c.TAMANHO,
        i.DATA_TYPE,
        i.IS_NULLABLE,
        CASE WHEN pk.COLUMN_NAME IS NOT NULL THEN 1 ELSE 0 END AS IS_PK,
        CASE WHEN fk.COLUMN_NAME IS NOT NULL THEN 1 ELSE 0 END AS IS_FK,
        fk.REF_TABLE
      FROM TDDCAM c
      LEFT JOIN INFORMATION_SCHEMA.COLUMNS i
        ON i.TABLE_NAME = c.NOMETAB AND i.COLUMN_NAME = c.NOMECAMPO
      LEFT JOIN (
        SELECT ku.TABLE_NAME, ku.COLUMN_NAME
        FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
        JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE ku
          ON tc.CONSTRAINT_NAME = ku.CONSTRAINT_NAME
        WHERE tc.CONSTRAINT_TYPE = 'PRIMARY KEY'
      ) pk ON pk.TABLE_NAME = c.NOMETAB AND pk.COLUMN_NAME = c.NOMECAMPO
      LEFT JOIN (
        SELECT
          cu.TABLE_NAME, cu.COLUMN_NAME,
          ku2.TABLE_NAME AS REF_TABLE
        FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS rc
        JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE cu
          ON rc.CONSTRAINT_NAME = cu.CONSTRAINT_NAME
        JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE ku2
          ON rc.UNIQUE_CONSTRAINT_NAME = ku2.CONSTRAINT_NAME
      ) fk ON fk.TABLE_NAME = c.NOMETAB AND fk.COLUMN_NAME = c.NOMECAMPO
      WHERE c.NOMETAB = '${safe}'
      ORDER BY c.ORDEM, c.NUCAMPO`;

    interface Row {
      NOMECAMPO: string;
      DESCRCAMPO: string;
      TIPCAMPO: string;
      TAMANHO: number | null;
      DATA_TYPE: string | null;
      IS_NULLABLE: string | null;
      IS_PK: number;
      IS_FK: number;
      REF_TABLE: string | null;
    }

    const rows = await qe.executeQuery<Row>(sql);
    const result = rows.map((r) => ({
      nomeCampo: r.NOMECAMPO ?? '',
      descricao: r.DESCRCAMPO ?? '',
      tipo: r.DATA_TYPE ?? r.TIPCAMPO ?? '',
      tamanho: r.TAMANHO,
      obrigatorio: r.IS_NULLABLE === 'NO',
      chavePrimaria: r.IS_PK === 1,
      chaveEstrangeira: r.IS_FK === 1,
      tabelaReferencia: r.REF_TABLE ?? null,
    }));
    cache.set(key, result, CACHE_TTL.DICTIONARY);
    return result;
  }

  async search(term: string): Promise<DictTable[]> {
    const safe = escapeSqlString(term);
    const sql = `
      SELECT TOP 50 NOMETAB, DESCRTAB
      FROM TDDTAB
      WHERE NOMETAB LIKE '%${safe}%' OR DESCRTAB LIKE '%${safe}%'
      ORDER BY NOMETAB`;
    const rows = await qe.executeQuery<{ NOMETAB: string; DESCRTAB: string }>(sql);
    return rows.map((r) => ({
      nomeTabela: r.NOMETAB ?? '',
      descricao: r.DESCRTAB ?? '',
    }));
  }
}
