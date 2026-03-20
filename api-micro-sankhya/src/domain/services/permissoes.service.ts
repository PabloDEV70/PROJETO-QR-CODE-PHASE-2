import { QueryExecutor } from '../../infra/api-mother/queryExecutor';
import {
  getResumo, getGrupos, getGrupoMembros, getGrupoTelas, getConflitos,
} from '../../sql-queries/TDDPER';
import type {
  ResumoRow, GrupoListRow, GrupoMembroRow, GrupoTelaRow, ConflitoRow,
  PermissoesResumo, GrupoListItem, GrupoDetalhes, GrupoMembro, GrupoTela,
  ConflitoItem,
} from '../../types/TDDPER';
import { PermissoesTelaService } from './permissoes-telas.service';
import { PermissoesUsuarioService } from './permissoes-usuarios.service';

function nomeAmigavel(idacesso: string): string {
  const parts = idacesso.split('.');
  return parts[parts.length - 1] || idacesso;
}

export class PermissoesService {
  private qe: QueryExecutor;
  private telas: PermissoesTelaService;
  private usuarios: PermissoesUsuarioService;

  constructor() {
    this.qe = new QueryExecutor();
    this.telas = new PermissoesTelaService(this.qe);
    this.usuarios = new PermissoesUsuarioService(this.qe);
  }

  async getResumo(): Promise<PermissoesResumo> {
    const rows = await this.qe.executeQuery<ResumoRow>(getResumo);
    return rows[0] || { totalTelas: 0, totalUsuarios: 0, totalGrupos: 0, totalAtribuicoes: 0 };
  }

  getTelas(params: { page?: number; limit?: number; termo?: string }) {
    return this.telas.getTelas(params);
  }
  getTelaDetalhes(idacesso: string) {
    return this.telas.getTelaDetalhes(idacesso);
  }
  getUsuarios(params: { page?: number; limit?: number; termo?: string }) {
    return this.usuarios.getUsuarios(params);
  }
  getUsuarioDetalhes(codusu: number) {
    return this.usuarios.getUsuarioDetalhes(codusu);
  }

  async getGrupos(): Promise<GrupoListItem[]> {
    const rows = await this.qe.executeQuery<GrupoListRow>(getGrupos);
    return rows.map((r): GrupoListItem => ({
      codGrupo: r.CODGRUPO, nomeGrupo: r.NOMEGRUPO,
      qtdMembros: r.qtdMembros, qtdTelas: r.qtdTelas,
    }));
  }

  async getGrupoDetalhes(codgrupo: number): Promise<GrupoDetalhes | null> {
    const [membrosRows, telasRows, grupoRows] = await Promise.all([
      this.qe.executeQuery<GrupoMembroRow>(
        getGrupoMembros.replace(/@codgrupo/g, codgrupo.toString()),
      ),
      this.qe.executeQuery<GrupoTelaRow>(
        getGrupoTelas.replace(/@codgrupo/g, codgrupo.toString()),
      ),
      this.qe.executeQuery<{ CODGRUPO: number; NOMEGRUPO: string }>(
        `SELECT CODGRUPO, RTRIM(NOMEGRUPO) AS NOMEGRUPO FROM TSIGRU WHERE CODGRUPO = ${codgrupo}`,
      ),
    ]);

    const grupo = grupoRows[0];
    if (!grupo) return null;

    return {
      codGrupo: grupo.CODGRUPO, nomeGrupo: grupo.NOMEGRUPO,
      membros: membrosRows.map((m): GrupoMembro => ({
        codUsu: m.CODUSU, nomeUsu: m.NOMEUSU,
        ativo: m.DTLIMACESSO === null || new Date(m.DTLIMACESSO) > new Date(),
      })),
      telas: telasRows.map((t): GrupoTela => ({
        idAcesso: t.IDACESSO, nomeAmigavel: nomeAmigavel(t.IDACESSO),
        acesso: t.ACESSO,
      })),
    };
  }

  async getConflitos() {
    const rows = await this.qe.executeQuery<ConflitoRow>(getConflitos);
    return rows.map((r): ConflitoItem => ({
      idAcesso: r.IDACESSO, nomeAmigavel: nomeAmigavel(r.IDACESSO),
      codUsu: r.CODUSU, nomeUsu: r.NOMEUSU,
      codGrupo: r.CODGRUPO, nomeGrupo: r.NOMEGRUPO,
      acessoUsuario: r.acessoUsuario, acessoGrupo: r.acessoGrupo,
    }));
  }
}
