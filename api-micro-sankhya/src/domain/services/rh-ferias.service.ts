import { QueryExecutor } from '../../infra/api-mother/queryExecutor';
import {
  feriasAtuais,
  feriasProximas,
  resumoFerias,
  solicitacoesFeriasPendentes,
} from '../../sql-queries/TFPFER';
import {
  Ferias,
  FeriasResumo,
  FeriasRow,
  FeriasResumoRow,
  SolicitacaoFeriasRow,
} from '../../types/TFPFER';

export interface FeriasParams {
  codemp?: number;
  coddep?: number;
}

export class RhFeriasService {
  private queryExecutor: QueryExecutor;

  constructor() {
    this.queryExecutor = new QueryExecutor();
  }

  async getFeriasAtuais(params?: FeriasParams): Promise<Ferias[]> {
    let sql = feriasAtuais;
    if (params?.codemp) {
      sql = sql.replace('ORDER BY', `AND FER.CODEMP = ${params.codemp}\nORDER BY`);
    }
    if (params?.coddep) {
      sql = sql.replace('ORDER BY', `AND FUN.CODDEP = ${params.coddep}\nORDER BY`);
    }
    const rows = await this.queryExecutor.executeQuery<FeriasRow>(sql);
    return rows.map(this.mapRow);
  }

  async getFeriasProximas(dias?: number, params?: FeriasParams): Promise<Ferias[]> {
    let sql = feriasProximas.replace(/@dias/g, (dias || 30).toString());
    if (params?.codemp) {
      sql = sql.replace('ORDER BY', `AND FER.CODEMP = ${params.codemp}\nORDER BY`);
    }
    if (params?.coddep) {
      sql = sql.replace('ORDER BY', `AND FUN.CODDEP = ${params.coddep}\nORDER BY`);
    }
    const rows = await this.queryExecutor.executeQuery<FeriasRow>(sql);
    return rows.map(this.mapRow);
  }

  async getResumo(): Promise<FeriasResumo> {
    const [resumoRows, pendentesRows] = await Promise.all([
      this.queryExecutor.executeQuery<FeriasResumoRow>(resumoFerias),
      this.queryExecutor.executeQuery<SolicitacaoFeriasRow>(solicitacoesFeriasPendentes),
    ]);

    const r = resumoRows[0] || { emFeriasAgora: 0, programadas: 0 };
    const p = pendentesRows[0]?.pendentes || 0;

    return {
      emFeriasAgora: r.emFeriasAgora,
      programadasProximos30Dias: r.programadas,
      pendentesAprovacao: p,
    };
  }

  private mapRow(row: FeriasRow): Ferias {
    return {
      codemp: row.codemp,
      codfunc: row.codfunc,
      codparc: row.codparc,
      nomeFuncionario: row.nomeFuncionario,
      nomeEmpresa: row.nomeEmpresa,
      dtSaida: row.dtSaida,
      numDiasFer: row.numDiasFer,
      dtRetorno: row.dtRetorno,
      abonoPec: row.abonoPec,
      aprovado: row.aprovado,
      dtPrevista: row.dtPrevista,
      departamento: row.departamento,
      cargo: row.cargo,
    };
  }
}
