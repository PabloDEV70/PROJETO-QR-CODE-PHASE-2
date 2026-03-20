import type { CampoDicionario } from '@/types/database-types';

type FormatArgs = {
  tableName: string;
  fields: CampoDicionario[];
  pkCols: string[];
  fkMap: Map<string, string>;
};

function sqlType(tipo: string, tamanho: number | null): string {
  switch (tipo) {
    case 'N': return tamanho ? `DECIMAL(${tamanho})` : 'INT';
    case 'A': return `VARCHAR(${tamanho ?? 255})`;
    case 'D': return 'DATE';
    case 'T': return 'DATETIME';
    case 'O': return `VARCHAR(${tamanho ?? 255})`;
    default: return `VARCHAR(${tamanho ?? 255})`;
  }
}

function tsType(tipo: string): string {
  switch (tipo) {
    case 'N': return 'number';
    case 'D': case 'T': return 'string';
    default: return 'string';
  }
}

export function toSqlCreate({ tableName, fields, pkCols, fkMap }: FormatArgs): string {
  const lines = fields.map((f) => {
    const isPk = pkCols.includes(f.nomeCampo);
    const nullable = isPk ? ' NOT NULL' : ' NULL';
    const fkRef = fkMap.get(f.nomeCampo);
    const comment = f.descricao ? `  -- ${f.descricao}` : '';
    const fkComment = fkRef ? ` (FK -> ${fkRef})` : '';
    return `  ${f.nomeCampo.padEnd(20)} ${sqlType(f.tipo, f.tamanho).padEnd(15)}${nullable},${comment}${fkComment}`;
  });
  const pkLine = pkCols.length > 0
    ? `\n  CONSTRAINT PK_${tableName} PRIMARY KEY (${pkCols.join(', ')})`
    : '';
  return `CREATE TABLE ${tableName} (\n${lines.join('\n')}${pkLine}\n);`;
}

export function toTypeScript({ tableName, fields, pkCols }: FormatArgs): string {
  const lines = fields.map((f) => {
    const isPk = pkCols.includes(f.nomeCampo);
    const type = isPk ? tsType(f.tipo) : `${tsType(f.tipo)} | null`;
    const comment = f.descricao ? `  /** ${f.descricao} */\n` : '';
    return `${comment}  ${f.nomeCampo}: ${type};`;
  });
  return `export interface ${tableName} {\n${lines.join('\n')}\n}`;
}

export function toJson({ tableName, fields, pkCols, fkMap }: FormatArgs): string {
  const obj = {
    table: tableName,
    primaryKeys: pkCols,
    fields: fields.map((f) => ({
      name: f.nomeCampo,
      type: f.tipo,
      size: f.tamanho,
      description: f.descricao,
      pk: pkCols.includes(f.nomeCampo),
      fk: fkMap.get(f.nomeCampo) ?? null,
    })),
  };
  return JSON.stringify(obj, null, 2);
}

export function toMarkdown({ fields, pkCols, fkMap }: FormatArgs): string {
  const header = '| Campo | Tipo | Tam | PK | FK | Descricao |';
  const sep = '|-------|------|-----|----|----|-----------|';
  const rows = fields.map((f) => {
    const isPk = pkCols.includes(f.nomeCampo) ? 'PK' : '-';
    const fk = fkMap.get(f.nomeCampo) ?? '-';
    const tam = f.tamanho ?? '-';
    return `| ${f.nomeCampo} | ${f.tipo} | ${tam} | ${isPk} | ${fk} | ${f.descricao} |`;
  });
  return [header, sep, ...rows].join('\n');
}

export function toTsv({ fields, pkCols, fkMap }: FormatArgs): string {
  const header = ['Campo', 'Tipo', 'Tamanho', 'PK', 'FK', 'Descricao'].join('\t');
  const rows = fields.map((f) => {
    const isPk = pkCols.includes(f.nomeCampo) ? 'PK' : '';
    const fk = fkMap.get(f.nomeCampo) ?? '';
    const tam = f.tamanho ?? '';
    return [f.nomeCampo, f.tipo, tam, isPk, fk, f.descricao].join('\t');
  });
  return [header, ...rows].join('\n');
}
