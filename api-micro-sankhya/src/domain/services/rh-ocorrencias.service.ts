import { QueryExecutor } from '../../infra/api-mother/queryExecutor';
import {
  ocorrenciasAtivas,
  resumoOcorrenciasAtivas,
  ocorrenciasPorTipo,
} from '../../sql-queries/TFPOCO';
import {
  Ocorrencia,
  OcorrenciaResumo,
  OcorrenciaRow,
  OcorrenciaResumoRow,
  OcorrenciaPorTipoRow,
} from '../../types/TFPOCO';

export interface OcorrenciaParams {
  codemp?: number;
  coddep?: number;
}

export class RhOcorrenciasService {
  private queryExecutor: QueryExecutor;

  constructor() {
    this.queryExecutor = new QueryExecutor();
  }

  async getOcorrenciasAtivas(params?: OcorrenciaParams): Promise<Ocorrencia[]> {
    let sql = ocorrenciasAtivas;
    if (params?.codemp) {
      sql = sql.replace('ORDER BY', `AND OCO.CODEMP = ${Number(params.codemp)}\nORDER BY`);
    }
    if (params?.coddep) {
      sql = sql.replace('ORDER BY', `AND FUN.CODDEP = ${Number(params.coddep)}\nORDER BY`);
    }
    const rows = await this.queryExecutor.executeQuery<OcorrenciaRow>(sql);
    return rows.map(this.mapRow);
  }

  async getResumo(params?: OcorrenciaParams): Promise<OcorrenciaResumo> {
    const [resumoRows, tipoRows] = await Promise.all([
      this.queryExecutor.executeQuery<OcorrenciaResumoRow>(resumoOcorrenciasAtivas),
      this.queryExecutor.executeQuery<OcorrenciaPorTipoRow>(ocorrenciasPorTipo),
    ]);

    return {
      totalAtivas: resumoRows[0]?.totalAtivas || 0,
      porTipo: tipoRows.map((row) => ({
        codHistoCor: row.codHistoCor,
        descricao: row.descricao,
        quantidade: row.quantidade,
      })),
    };
  }

  private mapRow(row: OcorrenciaRow): Ocorrencia {
    return {
      codemp: row.codemp,
      codfunc: row.codfunc,
      codparc: row.codparc,
      nomeFuncionario: row.nomeFuncionario,
      nomeEmpresa: row.nomeEmpresa,
      codHistoCor: row.codHistoCor,
      descricaoHistoCor: row.descricaoHistoCor,
      dtInicio: row.dtInicio,
      dtFinal: row.dtFinal,
      dtPrevRetorno: row.dtPrevRetorno,
      descricao: row.descricao,
      cid: row.cid,
      departamento: row.departamento,
      cargo: row.cargo,
    };
  }
}
