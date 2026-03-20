import { QueryExecutor } from '../../infra/api-mother/queryExecutor';
import { escapeSqlString } from '../../shared/sql-sanitize';
import { PublicQueryExecutor } from '../../infra/api-mother/publicQueryExecutor';
import { getUserToken } from '../../infra/api-mother/database-context';
import { TfpFunVinculo } from '../../types/TFPFUN/tfp-fun-vinculo';
import { TfpFunHistorico } from '../../types/TFPFUN/tfp-fun-historico';
import { TfpHorDia } from '../../types/TFPHOR/tfp-hor-dia';
import { TfpHorSemana } from '../../types/TFPHOR/tfp-hor-semana';
import { labelDiaSemana } from '../../shared/constants/dias-semana';
import {
  formatHorario,
  calcularMinutosTurno,
  calcularHorasSemanais,
  formatMinutosParaHoras,
  labelSituacao,
} from '../../shared/utils/sankhya-formatters';
import {
  vinculosPorParceiro,
  getFotoPorCodparc,
  getFotoPorCodfunc,
  temFoto,
  buscarFuncionarios,
} from '../../sql-queries/TFPFUN';
import { cargaHoraria } from '../../sql-queries/TFPHOR';

interface VinculoRow {
  codemp: number;
  codfunc: number;
  codparc: number;
  nomeparc: string;
  situacao: string;
  dtadm: string;
  dtdem: string | null;
  codcargahor: number | null;
  salario: number | null;
  codcargo: number | null;
  cargo: string | null;
  codfuncao: number | null;
  funcao: string | null;
  coddep: number | null;
  departamento: string | null;
  empresa: string | null;
  telefoneParceiro: string | null;
  emailParceiro: string | null;
}

interface HorarioRow {
  codcargahor: number;
  diasem: number;
  turno: number;
  entrada: number | null;
  saida: number | null;
  pausa: number | null;
  descansosem: number | null;
}

interface FotoRow {
  CODPARC: number | null;
  CODEMP: number;
  CODFUNC: number;
  IMAGEM: Buffer | { type: string; data: number[] } | Record<string, number> | null;
}

interface TemFotoRow {
  CODPARC: number;
  temFoto: number;
  tamanhoBytes: number | null;
}

export interface FotoInfo {
  codparc: number;
  temFoto: boolean;
  tamanhoBytes: number | null;
}

export interface FotoResult {
  codparc: number;
  imagem: Buffer;
}

export interface FuncionarioBusca {
  codparc: number;
  nomeparc: string;
  codfunc: number;
  codemp: number;
  cargo: string | null;
  departamento: string | null;
  temFoto: boolean;
}

export class FuncionariosService {
  private queryExecutor: QueryExecutor;
  private publicQueryExecutor: PublicQueryExecutor;

  constructor() {
    this.queryExecutor = new QueryExecutor();
    this.publicQueryExecutor = new PublicQueryExecutor();
  }

  async getVinculos(codparc: number): Promise<TfpFunVinculo[]> {
    const sql = vinculosPorParceiro.replace(/@codparc/g, codparc.toString());
    const rows = await this.queryExecutor.executeQuery<VinculoRow>(sql);
    return rows.map(this.mapVinculo);
  }

  async getHistorico(codparc: number): Promise<TfpFunHistorico> {
    const vinculos = await this.getVinculos(codparc);
    const nomeparc = (vinculos[0] as any)?.nomeparc || '';
    const vinculoAtivo = vinculos.find(v => v.situacao === '1') || null;
    return { codparc, nomeparc, vinculos, totalVinculos: vinculos.length, vinculoAtivo };
  }

  async getCargaHoraria(codcargahor: number): Promise<TfpHorSemana> {
    const sql = cargaHoraria.replace(/@codcargahor/g, codcargahor.toString());
    const rows = await this.queryExecutor.executeQuery<HorarioRow>(sql);
    const dias = rows.map(this.mapHorarioDia);
    const totalMinutos = calcularHorasSemanais(rows);
    return {
      codcargahor, dias,
      totalHorasSemana: totalMinutos,
      totalHorasSemanaFmt: formatMinutosParaHoras(totalMinutos),
    };
  }

  async verificaFoto(codparc: number): Promise<FotoInfo | null> {
    const sql = temFoto.replace(/@codparc/g, codparc.toString());
    const rows = await this.executeWithFallback<TemFotoRow>(sql);
    if (rows.length === 0) return null;
    return { codparc: rows[0].CODPARC, temFoto: rows[0].temFoto === 1, tamanhoBytes: rows[0].tamanhoBytes };
  }

  async getFoto(codparc: number): Promise<FotoResult | null> {
    const sql = getFotoPorCodparc.replace(/@codparc/g, codparc.toString());
    return this.parseFotoRow(sql);
  }

  async getFotoByCodfunc(codemp: number, codfunc: number): Promise<FotoResult | null> {
    const sql = getFotoPorCodfunc
      .replace(/@codemp/g, codemp.toString())
      .replace(/@codfunc/g, codfunc.toString());
    return this.parseFotoRow(sql);
  }

  private async parseFotoRow(sql: string): Promise<FotoResult | null> {
    const rows = await this.executeWithFallback<FotoRow>(sql);
    if (rows.length === 0 || !rows[0].IMAGEM) return null;

    const img = rows[0].IMAGEM;
    let buffer: Buffer;
    if (Buffer.isBuffer(img)) {
      buffer = img;
    } else if (img.data && Array.isArray(img.data)) {
      buffer = Buffer.from(img.data);
    } else if (typeof img === 'object') {
      // API Mother returns VARBINARY as { "0":255, "1":216, ... }
      const keys = Object.keys(img).map(Number).sort((a, b) => a - b);
      const bytes = new Uint8Array(keys.length);
      for (let i = 0; i < keys.length; i++) {
        bytes[i] = (img as Record<string, number>)[keys[i]];
      }
      buffer = Buffer.from(bytes);
    } else {
      return null;
    }

    return { codparc: rows[0].CODPARC || 0, imagem: buffer };
  }

  /**
   * User JWT when available (authenticated context), API key fallback (public routes).
   */
  private async executeWithFallback<T = Record<string, unknown>>(sql: string): Promise<T[]> {
    if (getUserToken()) {
      return this.queryExecutor.executeQuery<T>(sql);
    }
    return this.publicQueryExecutor.executeQuery<T>(sql);
  }

  async buscar(termo: string): Promise<FuncionarioBusca[]> {
    const sanitized = escapeSqlString(termo.substring(0, 100).trim());
    if (!sanitized) return [];

    const sql = buscarFuncionarios.replace(/@termo/g, sanitized);
    interface BuscaRow {
      codparc: number;
      nomeparc: string;
      codfunc: number;
      codemp: number;
      cargo: string | null;
      departamento: string | null;
      temFoto: number;
    }
    const rows = await this.queryExecutor.executeQuery<BuscaRow>(sql);
    return rows.map((r) => ({ ...r, temFoto: r.temFoto === 1 }));
  }

  private mapVinculo(row: VinculoRow): TfpFunVinculo {
    return {
      codemp: row.codemp,
      codfunc: row.codfunc,
      codparc: row.codparc,
      situacao: row.situacao as TfpFunVinculo['situacao'],
      situacaoLabel: labelSituacao(row.situacao),
      dtadm: row.dtadm,
      dtdem: row.dtdem,
      codcargahor: row.codcargahor,
      salario: row.salario,
      codcargo: row.codcargo,
      cargo: row.cargo,
      codfuncao: row.codfuncao,
      funcao: row.funcao,
      coddep: row.coddep,
      departamento: row.departamento,
      empresa: row.empresa,
    };
  }

  private mapHorarioDia(row: HorarioRow): TfpHorDia {
    const folga = row.entrada === null && row.saida === null;
    return {
      codcargahor: row.codcargahor,
      diasem: row.diasem,
      diasemLabel: labelDiaSemana(row.diasem),
      turno: row.turno,
      entrada: row.entrada,
      saida: row.saida,
      entradaFmt: formatHorario(row.entrada),
      saidaFmt: formatHorario(row.saida),
      horasTurno: calcularMinutosTurno(row.entrada, row.saida),
      folga,
    };
  }
}
