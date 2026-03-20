import { QueryExecutor } from '../../infra/api-mother/queryExecutor';
import { TgfPar, RdoResumo, OsManutencaoResumo } from '../../types/TGFPAR';
import { TgfParPerfilCompleto } from '../../types/TGFPAR/tgf-par-perfil-completo';
import { PerfilInclude } from '../../types/TGFPAR/perfil-include';
import * as Q from '../../sql-queries/TGFPAR';
import { FuncionariosService } from './funcionarios.service';

export interface PaginatedOptions {
  page: number;
  limit: number;
}

interface PerfilRow {
  codparc: number;
  nomeparc: string;
  cgc_cpf: string;
  cgc_cpf_formatted: string;
  tippessoa: 'F' | 'J';
  ativo: 'S' | 'N';
  razaosocial: string | null;
  cliente: 'S' | 'N';
  fornecedor: 'S' | 'N';
  motorista: 'S' | 'N';
  vendedor: 'S' | 'N';
  transportadora: 'S' | 'N';
  codend: number | null;
  nomeend: string | null;
  numend: string | null;
  complemento: string | null;
  codbai: number | null;
  nomebai: string | null;
  codcid: number | null;
  nomecid: string | null;
  uf: string | null;
  cep: string | null;
  emailParceiro: string | null;
  telefoneParceiro: string | null;
  fax: string | null;
  dtcad: string | null;
  dtalter: string | null;
  limcred: number | null;
  bloquear: 'S' | 'N' | null;
  usuario: 'S' | 'N';
  funcionario: 'S' | 'N';
  vinculosCount: number;
  codusu: number | null;
  nomeusu: string | null;
  emailUsuario: string | null;
  telefoneUsuario: string | null;
}

export class ParceirosDetailService {
  private queryExecutor: QueryExecutor;
  private funcionariosService: FuncionariosService;

  constructor() {
    this.queryExecutor = new QueryExecutor();
    this.funcionariosService = new FuncionariosService();
  }

  async getById(codparc: number): Promise<TgfPar | null> {
    const sql = Q.buscarPorId.replace('@codparc', codparc.toString());
    const rows = await this.queryExecutor.executeQuery<TgfPar>(sql);
    return rows[0] || null;
  }

  async getPerfilCompleto(
    codparc: number,
    includes: PerfilInclude[] = [],
  ): Promise<TgfParPerfilCompleto | null> {
    const sql = Q.perfilCompleto.replace(/@codparc/g, codparc.toString());
    const rows = await this.queryExecutor.executeQuery<PerfilRow>(sql);
    if (rows.length === 0) return null;

    const row = rows[0];

    const perfil: TgfParPerfilCompleto = {
      codparc: row.codparc,
      nomeparc: row.nomeparc,
      cgcCpf: row.cgc_cpf,
      cgcCpfFormatted: row.cgc_cpf_formatted,
      tippessoa: row.tippessoa,
      ativo: row.ativo,
      razaosocial: row.razaosocial,
      papeis: {
        cliente: row.cliente,
        fornecedor: row.fornecedor,
        motorista: row.motorista,
        vendedor: row.vendedor,
        transportadora: row.transportadora,
        usuario: row.usuario,
        funcionario: row.funcionario,
      },
      endereco: {
        codend: row.codend,
        nomeend: row.nomeend,
        numend: row.numend,
        complemento: row.complemento,
        codbai: row.codbai,
        nomebai: row.nomebai,
        codcid: row.codcid,
        nomecid: row.nomecid,
        uf: row.uf,
        cep: row.cep,
      },
      contato: {
        emailParceiro: row.emailParceiro,
        telefoneParceiro: row.telefoneParceiro,
        fax: row.fax,
        emailUsuario: row.emailUsuario,
        telefoneUsuario: row.telefoneUsuario,
      },
      dtcad: row.dtcad,
      dtalter: row.dtalter,
      limcred: row.limcred,
      bloquear: row.bloquear,
      vinculosCount: row.vinculosCount,
      usuarioSistema: row.codusu
        ? { codusu: row.codusu, nomeusu: row.nomeusu! }
        : null,
    };

    if (includes.includes('funcionario') && row.funcionario === 'S') {
      perfil.funcionario = await this.funcionariosService.getHistorico(codparc);
    }

    return perfil;
  }

  async getRdos(codparc: number, options: PaginatedOptions): Promise<RdoResumo[]> {
    const { page, limit } = options;
    const offset = (page - 1) * limit;

    const sql = Q.rdosPorParceiro
      .replace(/@codparc/g, codparc.toString())
      .replace('-- @WHERE', '')
      .replace(/@OFFSET/g, offset.toString())
      .replace(/@LIMIT/g, limit.toString());

    return this.queryExecutor.executeQuery<RdoResumo>(sql);
  }

  async getOsManutencao(
    codparc: number,
    options: PaginatedOptions,
  ): Promise<OsManutencaoResumo[]> {
    const { page, limit } = options;
    const offset = (page - 1) * limit;

    const sql = Q.osManutencaoPorParceiro
      .replace(/@codparc/g, codparc.toString())
      .replace('-- @WHERE', '')
      .replace(/@OFFSET/g, offset.toString())
      .replace(/@LIMIT/g, limit.toString());

    return this.queryExecutor.executeQuery<OsManutencaoResumo>(sql);
  }
}
