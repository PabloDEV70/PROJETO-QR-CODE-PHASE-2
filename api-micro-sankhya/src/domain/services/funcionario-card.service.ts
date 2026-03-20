import { QueryExecutor } from '../../infra/api-mother/queryExecutor';
import { FuncionarioCardPublico, CardPublicoRow } from '../../types/TFPFUN';
import { labelSituacao } from '../../shared/utils/sankhya-formatters';
import { getCardPublico } from '../../sql-queries/TFPFUN';

export class FuncionarioCardService {
  private qe: QueryExecutor;

  constructor() {
    this.qe = new QueryExecutor();
  }

  async getCardPublico(
    codemp: number,
    codfunc: number,
  ): Promise<FuncionarioCardPublico | null> {
    const sql = getCardPublico
      .replace(/@codemp/g, codemp.toString())
      .replace(/@codfunc/g, codfunc.toString());
    const rows = await this.qe.executeQuery<CardPublicoRow>(sql);
    if (!rows.length) return null;

    const r = rows[0];
    return {
      codemp: r.CODEMP,
      codfunc: r.CODFUNC,
      nome: r.NOME,
      cargo: r.CARGO,
      funcao: r.FUNCAO,
      departamento: r.DEPARTAMENTO,
      empresa: r.EMPRESA,
      situacao: String(r.SITUACAO),
      situacaoLabel: labelSituacao(String(r.SITUACAO)),
      dtadm: r.DTADM,
    };
  }
}
