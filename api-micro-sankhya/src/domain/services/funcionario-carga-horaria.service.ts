import { QueryExecutor } from '../../infra/api-mother/queryExecutor';
import {
  FuncionarioCargaHoraria,
  FuncionarioCargaDia,
  FuncionarioCargaTurno,
} from '../../types/TFPFUN';
import { formatMinutosParaHoras, formatHorario } from '../../shared/utils/sankhya-formatters';
import { labelDiaSemana } from '../../shared/constants/dias-semana';
import { cargaHoraria } from '../../sql-queries/TFPHOR';
import { cargaHorariaAtual } from '../../sql-queries/TFPFHO';

interface HorarioRow {
  codcargahor: number;
  diasem: number;
  turno: number;
  entrada: number | null;
  saida: number | null;
}

interface CargaHorariaAtualRow {
  codcargahor: number;
  descricao: string | null;
  dtInicioEscala: string | null;
}

/**
 * Service para buscar carga horaria do funcionario.
 * Fonte correta: TFPFHO (historico de escalas), com fallback para TFPFUN.
 */
export class FuncionarioCargaHorariaService {
  private qe: QueryExecutor;

  constructor() {
    this.qe = new QueryExecutor();
  }

  /**
   * Busca carga horaria atual via TFPFHO (historico de escalas).
   * TFPFHO e a fonte correta pois TFPFUN.CODCARGAHOR pode estar desatualizado.
   */
  async getCargaHorariaAtual(
    codemp: number,
    codfunc: number,
  ): Promise<FuncionarioCargaHoraria | null> {
    const sql = cargaHorariaAtual
      .replace(/@codemp/g, codemp.toString())
      .replace(/@codfunc/g, codfunc.toString());
    const rows = await this.qe.executeQuery<CargaHorariaAtualRow>(sql);
    if (rows.length === 0) return null;
    const { codcargahor, descricao } = rows[0];
    return this.getCargaHoraria(codcargahor, descricao);
  }

  async getCargaHoraria(
    codcargahor: number,
    descricao: string | null,
  ): Promise<FuncionarioCargaHoraria | null> {
    const sql = cargaHoraria.replace(/@codcargahor/g, codcargahor.toString());
    const rows = await this.qe.executeQuery<HorarioRow>(sql);
    if (rows.length === 0) return null;

    // Agrupar turnos por dia da semana
    const diasMap = new Map<number, FuncionarioCargaTurno[]>();
    for (const h of rows) {
      if (!diasMap.has(h.diasem)) diasMap.set(h.diasem, []);
      if (h.entrada !== null && h.saida !== null) {
        diasMap.get(h.diasem)!.push({
          entrada: formatHorario(h.entrada) || '00:00',
          saida: formatHorario(h.saida) || '00:00',
          minutos: this.calcMinutos(h.entrada, h.saida),
        });
      }
    }

    // Montar array de dias (1-7)
    const dias: FuncionarioCargaDia[] = [];
    for (let diasem = 1; diasem <= 7; diasem++) {
      const turnos = diasMap.get(diasem) || [];
      const minutosPrevistos = turnos.reduce((s, t) => s + t.minutos, 0);
      dias.push({
        diasem,
        diasemLabel: labelDiaSemana(diasem),
        minutosPrevistos,
        folga: turnos.length === 0,
        turnos,
      });
    }

    const totalMinutos = dias.reduce((sum, d) => sum + d.minutosPrevistos, 0);

    return {
      codcargahor,
      descricao,
      totalMinutosSemana: totalMinutos,
      totalHorasSemanaFmt: formatMinutosParaHoras(totalMinutos),
      dias,
    };
  }

  /** Converte HHMM inteiros (ex: 700=07:00, 1200=12:00) para minutos de diferenca */
  calcMinutos(entrada: number | null, saida: number | null): number {
    if (entrada === null || saida === null) return 0;
    const entradaMin = Math.floor(entrada / 100) * 60 + (entrada % 100);
    const saidaMin = Math.floor(saida / 100) * 60 + (saida % 100);
    return saidaMin > entradaMin ? saidaMin - entradaMin : 0;
  }
}
