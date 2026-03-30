import { QueryExecutor } from '../../infra/api-mother/queryExecutor';
import { getUsuarios, countUsuarios, getUsuarioDiretas, getUsuarioHerdadas } from '../../sql-queries/TDDPER';
import { escapeSqlLike } from '../../shared/sql-sanitize';
import type {
  UsuarioListRow, UsuarioPermDiretaRow, UsuarioPermHerdadaRow,
  UsuarioListItem, UsuarioDetalhes,
  UsuarioPermDireta, UsuarioPermHerdada, ConflitoItem,
} from '../../types/TDDPER';

function nomeAmigavel(idacesso: string): string {
  const parts = idacesso.split('.');
  return parts[parts.length - 1] || idacesso;
}

export class PermissoesUsuarioService {
  constructor(private qe: QueryExecutor) {}

  async getUsuarios(params: { page?: number; limit?: number; termo?: string }) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 50));
    const offset = (page - 1) * limit;
    const whereClause = params.termo
      ? `AND U.NOMEUSU LIKE ${escapeSqlLike(params.termo)}`
      : '';

    const [rows, countRows] = await Promise.all([
      this.qe.executeQuery<UsuarioListRow>(
        getUsuarios
          .replace(/@offset/g, offset.toString())
          .replace(/@limit/g, limit.toString())
          .replace(/@whereClause/g, whereClause),
      ),
      this.qe.executeQuery<{ total: number }>(
        countUsuarios.replace(/@whereClause/g, whereClause),
      ),
    ]);

    const total = countRows[0]?.total || 0;
    return {
      data: rows.map((r): UsuarioListItem => ({
        codUsu: r.CODUSU, nomeUsu: r.NOMEUSU,
        codGrupo: r.CODGRUPO, nomeGrupo: r.NOMEGRUPO,
        qtdDiretas: r.qtdDiretas,
      })),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getUsuarioDetalhes(codusu: number): Promise<UsuarioDetalhes | null> {
    const userSql = `
SELECT U.CODUSU, RTRIM(U.NOMEUSU) AS NOMEUSU,
  U.CODGRUPO, RTRIM(G.NOMEGRUPO) AS NOMEGRUPO
FROM TSIUSU U
LEFT JOIN TSIGRU G ON U.CODGRUPO = G.CODGRUPO
WHERE U.CODUSU = ${Number(codusu)}`;

    const [userRows, diretasRows, herdadasRows] = await Promise.all([
      this.qe.executeQuery<{
        CODUSU: number; NOMEUSU: string; CODGRUPO: number; NOMEGRUPO: string | null;
      }>(userSql),
      this.qe.executeQuery<UsuarioPermDiretaRow>(
        getUsuarioDiretas.replace(/@codusu/g, codusu.toString()),
      ),
      this.qe.executeQuery<UsuarioPermHerdadaRow>(
        getUsuarioHerdadas.replace(/@codusu/g, codusu.toString()),
      ),
    ]);

    const user = userRows[0];
    if (!user) return null;

    const herdadasMap = new Map(herdadasRows.map((h) => [h.IDACESSO, h]));
    const conflitos: ConflitoItem[] = [];
    for (const d of diretasRows) {
      const h = herdadasMap.get(d.IDACESSO);
      if (h && d.ACESSO !== h.ACESSO) {
        conflitos.push({
          idAcesso: d.IDACESSO, nomeAmigavel: nomeAmigavel(d.IDACESSO),
          codUsu: user.CODUSU, nomeUsu: user.NOMEUSU,
          codGrupo: user.CODGRUPO, nomeGrupo: user.NOMEGRUPO || '',
          acessoUsuario: d.ACESSO, acessoGrupo: h.ACESSO,
        });
      }
    }

    return {
      codUsu: user.CODUSU, nomeUsu: user.NOMEUSU,
      codGrupo: user.CODGRUPO, nomeGrupo: user.NOMEGRUPO,
      diretas: diretasRows.map((d): UsuarioPermDireta => ({
        idAcesso: d.IDACESSO, nomeAmigavel: nomeAmigavel(d.IDACESSO), acesso: d.ACESSO,
      })),
      herdadas: herdadasRows.map((h): UsuarioPermHerdada => ({
        idAcesso: h.IDACESSO, nomeAmigavel: nomeAmigavel(h.IDACESSO),
        acesso: h.ACESSO, codGrupo: h.CODGRUPO, nomeGrupo: h.NOMEGRUPO,
      })),
      conflitos,
    };
  }
}
