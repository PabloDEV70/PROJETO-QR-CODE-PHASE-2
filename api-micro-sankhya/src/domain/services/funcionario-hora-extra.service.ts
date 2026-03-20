import { QueryExecutor } from '../../infra/api-mother/queryExecutor';
import { escapeSqlDate } from '../../shared/sql-sanitize';
import {
  FuncionarioCompleto,
  FuncionarioCompletoCargaDia,
  HoraExtraOptions,
  HoraExtraResponse,
} from '../../types/TFPFUN';
import {
  formatHorario,
  formatMinutosParaHoras,
  labelSituacao,
} from '../../shared/utils/sankhya-formatters';
import { labelDiaSemana } from '../../shared/constants/dias-semana';
import { funcionarioCompleto } from '../../sql-queries/TFPFUN';
import { cargaDiariaPorCodigo } from '../../sql-queries/TFPHOR';
import { apontamentosFuncionario } from '../../sql-queries/AD_RDOAPONTAMENTOS';
import {
  agruparPorDia,
  buildMeta,
  ApontamentoRow,
  CargaDiaRow,
  FuncionarioRow,
} from './funcionario-hora-extra.helpers';

export class FuncionarioHoraExtraService {
  private qe: QueryExecutor;

  constructor() {
    this.qe = new QueryExecutor();
  }

  async getPerfilCompleto(codparc: number): Promise<FuncionarioCompleto | null> {
    const sql = funcionarioCompleto.replace(/@codparc/g, codparc.toString());
    const rows = await this.qe.executeQuery<FuncionarioRow>(sql);
    if (rows.length === 0) return null;

    const r = rows[0];
    let cargaHoraria: FuncionarioCompleto['cargaHoraria'] = null;

    if (r.codcargahor) {
      cargaHoraria = await this.buildCargaHoraria(r.codcargahor);
    }

    return {
      codparc: r.codparc, nomeparc: r.nomeparc,
      cgcCpf: r.cgcCpf, telefone: r.telefone, email: r.email,
      codemp: r.codemp, codfunc: r.codfunc,
      situacao: r.situacao, situacaoLabel: labelSituacao(r.situacao),
      dtadm: r.dtadm, codcargahor: r.codcargahor, salario: r.salario,
      codcargo: r.codcargo, cargo: r.cargo,
      codfuncao: r.codfuncao, funcao: r.funcao,
      coddep: r.coddep, departamento: r.departamento,
      empresa: r.empresa, cargaHoraria,
    };
  }

  async getApontamentosComHoraExtra(
    codparc: number, options: HoraExtraOptions,
  ): Promise<HoraExtraResponse | null> {
    const perfil = await this.getPerfilCompleto(codparc);
    if (!perfil) return null;

    const cargaDia = perfil.codcargahor
      ? await this.fetchCargaDiaria(perfil.codcargahor)
      : new Map<number, { minutos: number; folga: boolean }>();

    const rows = await this.fetchApontamentos(codparc, options);
    const dias = agruparPorDia(rows, cargaDia);

    return {
      funcionario: {
        codparc: perfil.codparc, nomeparc: perfil.nomeparc,
        cargo: perfil.cargo, departamento: perfil.departamento,
        codcargahor: perfil.codcargahor,
        totalHorasSemanaPrevistas: perfil.cargaHoraria
          ? perfil.cargaHoraria.totalHorasSemanaFmt : null,
      },
      data: dias,
      meta: buildMeta(dias),
    };
  }

  private async buildCargaHoraria(codcargahor: number) {
    const sql = cargaDiariaPorCodigo
      .replace(/@codcargahor/g, codcargahor.toString());
    const rows = await this.qe.executeQuery<CargaDiaRow>(sql);

    const dias: FuncionarioCompletoCargaDia[] = rows.map((r) => ({
      diasem: r.diasem,
      diasemLabel: labelDiaSemana(r.diasem),
      minutosPrevistos: Number(r.minutosDia),
      folga: Number(r.folga) === 1,
    }));

    const totalMin = dias.reduce((s, d) => s + d.minutosPrevistos, 0);
    return {
      codcargahor, dias, totalMinutosSemana: totalMin,
      totalHorasSemanaFmt: formatMinutosParaHoras(totalMin),
    };
  }

  private async fetchCargaDiaria(codcargahor: number) {
    const sql = cargaDiariaPorCodigo
      .replace(/@codcargahor/g, codcargahor.toString());
    const rows = await this.qe.executeQuery<CargaDiaRow>(sql);
    const map = new Map<number, { minutos: number; folga: boolean }>();
    for (const r of rows) {
      map.set(r.diasem, {
        minutos: Number(r.minutosDia),
        folga: Number(r.folga) === 1,
      });
    }
    return map;
  }

  private async fetchApontamentos(codparc: number, opt: HoraExtraOptions) {
    const conditions: string[] = [];
    if (opt.dataInicio) {
      conditions.push(`rdo.DTREF >= ${escapeSqlDate(opt.dataInicio)}`);
    }
    if (opt.dataFim) {
      conditions.push(`rdo.DTREF <= ${escapeSqlDate(opt.dataFim)}`);
    }
    const where = conditions.length > 0
      ? `AND ${conditions.join(' AND ')}` : '';

    const sql = apontamentosFuncionario
      .replace(/@codparc/g, codparc.toString())
      .replace('-- @WHERE', where);

    return this.qe.executeQuery<ApontamentoRow>(sql);
  }
}
