import { QueryExecutor } from '../../infra/api-mother/queryExecutor';
import { getTelas, countTelas } from '../../sql-queries/TDDPER';
import { escapeSqlString, escapeSqlLike } from '../../shared/sql-sanitize';
import type {
  TelaListRow, TelaPermissaoRow, TelaAcaoRow,
  TelaListItem, TelaDetalhes, AcaoTela, PermissaoTela,
} from '../../types/TDDPER';

function nomeAmigavel(idacesso: string): string {
  const parts = idacesso.split('.');
  return parts[parts.length - 1] || idacesso;
}

export class PermissoesTelaService {
  constructor(private qe: QueryExecutor) {}

  async getTelas(params: { page?: number; limit?: number; termo?: string }) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 50));
    const offset = (page - 1) * limit;
    const whereClause = params.termo
      ? `AND p.IDACESSO LIKE ${escapeSqlLike(params.termo)}`
      : '';

    const [rows, countRows] = await Promise.all([
      this.qe.executeQuery<TelaListRow>(
        getTelas
          .replace(/@offset/g, offset.toString())
          .replace(/@limit/g, limit.toString())
          .replace(/@whereClause/g, whereClause),
      ),
      this.qe.executeQuery<{ total: number }>(
        countTelas.replace(/@whereClause/g, whereClause),
      ),
    ]);

    const total = countRows[0]?.total || 0;
    return {
      data: rows.map((r): TelaListItem => ({
        idAcesso: r.IDACESSO,
        nomeAmigavel: nomeAmigavel(r.IDACESSO),
        qtdGrupos: r.qtdGrupos,
        qtdUsuarios: r.qtdUsuarios,
      })),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getTelaDetalhes(idacesso: string): Promise<TelaDetalhes> {
    const safeId = escapeSqlString(idacesso);
    const permSql = `
SELECT PER.CODUSU, PER.CODGRUPO, RTRIM(PER.ACESSO) AS ACESSO,
  RTRIM(U.NOMEUSU) AS NOMEUSU, RTRIM(G.NOMEGRUPO) AS NOMEGRUPO
FROM TDDPER PER
LEFT JOIN TSIUSU U ON PER.CODUSU = U.CODUSU AND PER.CODUSU > 0
LEFT JOIN TSIGRU G ON PER.CODGRUPO = G.CODGRUPO AND PER.CODGRUPO > 0
WHERE PER.IDACESSO = '${safeId}'
ORDER BY PER.CODUSU DESC, PER.CODGRUPO`;

    const acoesSql = `
SELECT RTRIM(SIGLA) AS SIGLA, SEQUENCIA,
  RTRIM(DESCRICAO) AS DESCRICAO, RTRIM(CONTROLE) AS CONTROLE
FROM TDDIAC WHERE IDACESSO = '${safeId}'
ORDER BY SEQUENCIA`;

    const [permRows, acaoRows] = await Promise.all([
      this.qe.executeQuery<TelaPermissaoRow>(permSql),
      this.qe.executeQuery<TelaAcaoRow>(acoesSql),
    ]);

    return {
      idAcesso: idacesso,
      nomeAmigavel: nomeAmigavel(idacesso),
      acoes: acaoRows.map((a): AcaoTela => ({
        sigla: a.SIGLA, sequencia: a.SEQUENCIA,
        descricao: a.DESCRICAO, controle: a.CONTROLE,
      })),
      permissoes: permRows.map((p): PermissaoTela => ({
        codUsu: p.CODUSU, codGrupo: p.CODGRUPO, acesso: p.ACESSO,
        nomeUsu: p.NOMEUSU, nomeGrupo: p.NOMEGRUPO,
        tipo: p.CODUSU > 0 ? 'usuario' : 'grupo',
      })),
    };
  }
}
