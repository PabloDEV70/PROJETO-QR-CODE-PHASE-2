import { QueryExecutor } from '../../infra/api-mother/queryExecutor';
import { escapeSqlString } from '../../shared/sql-sanitize';
import * as Q from '../../sql-queries/HORAS_ESPERADAS';
import type {
  FuncionarioAtivoRaw, HorarioSemanalRaw,
  AusenciaRaw, FeriadoRaw,
  HorasEsperadasFuncionario, HorasEsperadasResponse,
  HorasEsperadasOptions,
} from '../../types/HORAS_ESPERADAS';
import {
  buildExcludedDates, buildScheduleLookup,
  calcFuncionarioHoras, buildResumo,
} from './horas-esperadas-calc';

export class HorasEsperadasService {
  private qe: QueryExecutor;

  constructor() {
    this.qe = new QueryExecutor();
  }

  async getHorasEsperadas(
    opts: HorasEsperadasOptions,
  ): Promise<HorasEsperadasResponse> {
    const { dataInicio, dataFim } = opts;
    const whereParts = this.buildWhere(opts);

    const funcSql = Q.getFuncionariosAtivos
      .replace(/@DataFim/g, this.esc(dataFim))
      .replace('-- @WHERE', whereParts);

    const ausenciaSql = Q.getAusencias
      .replace(/@DataInicio/g, this.esc(dataInicio))
      .replace(/@DataFim/g, this.esc(dataFim));

    const feriadoSql = Q.getFeriados
      .replace(/@DataInicio/g, this.esc(dataInicio))
      .replace(/@DataFim/g, this.esc(dataFim));

    const [funcionarios, horarios, ausencias, feriados] = await Promise.all([
      this.qe.executeQuery<FuncionarioAtivoRaw>(funcSql),
      this.qe.executeQuery<HorarioSemanalRaw>(Q.getHorariosSemanais),
      this.qe.executeQuery<AusenciaRaw>(ausenciaSql),
      this.qe.executeQuery<FeriadoRaw>(feriadoSql),
    ]);

    const scheduleLookup = buildScheduleLookup(horarios);
    const holidaySet = new Set(feriados.map((f) => f.dtFeriado));
    const excludedMap = buildExcludedDates(
      ausencias, dataInicio, dataFim,
    );

    const data: HorasEsperadasFuncionario[] = funcionarios
      .filter((f) => f.CODCARGAHOR != null)
      .map((f) => calcFuncionarioHoras(
        f, scheduleLookup, excludedMap, holidaySet, dataInicio, dataFim,
      ));

    return {
      data,
      resumo: buildResumo(data),
      feriados: feriados.map((f) => ({
        data: f.dtFeriado, descricao: f.descricao,
      })),
      periodo: { dataInicio, dataFim },
    };
  }

  private esc(val: string): string {
    return escapeSqlString(val);
  }

  private buildWhere(opts: HorasEsperadasOptions): string {
    const parts: string[] = [];
    if (opts.coddep) {
      parts.push(`AND f.CODDEP = ${parseInt(opts.coddep, 10)}`);
    }
    if (opts.codemp) {
      parts.push(`AND f.CODEMP = ${parseInt(opts.codemp, 10)}`);
    }
    if (opts.codparc) {
      parts.push(this.buildCodparcClause(opts.codparc));
    }
    return parts.join('\n');
  }

  private buildCodparcClause(raw: string): string {
    const exclude = raw.startsWith('!');
    const csv = exclude ? raw.slice(1) : raw;
    const ids = csv.split(',').map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n));
    if (ids.length === 0) return '';
    if (ids.length === 1) {
      return exclude
        ? `AND f.CODPARC <> ${ids[0]}`
        : `AND f.CODPARC = ${ids[0]}`;
    }
    const list = ids.join(',');
    return exclude
      ? `AND f.CODPARC NOT IN (${list})`
      : `AND f.CODPARC IN (${list})`;
  }
}
