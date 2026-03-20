import { MutationExecutor } from '../../infra/api-mother/mutationExecutor';
import { QueryExecutor } from '../../infra/api-mother/queryExecutor';
import { ValidationError } from '../errors/app-error';
import { getDatabase } from '../../infra/api-mother/database-context';
import { cache } from '../../shared/cache';
import { nextSeq as nextSeqSql } from '../../sql-queries/AD_APONTSOL/next-seq';
import { logger } from '../../shared/logger';
import { API_MOTHER_MAX_BATCH_SIZE, API_MOTHER_MAX_ITERATIONS_SAFETY } from '../../shared/constants/api-mother';

function bustCache() {
  cache.deleteByPrefix('apontamentos:');
}

function assertNotProd(operation: string) {
  const db = getDatabase();
  if (db === 'PROD') {
    throw new ValidationError(
      `Operacao "${operation}" bloqueada em PROD. Use TESTE ou TREINA.`,
    );
  }
}

function assertMutationSuccess(
  result: { sucesso?: boolean; foiSucesso?: boolean; registrosAfetados?: number; mensagem?: string },
  operation: string,
) {
  const ok = result.sucesso ?? result.foiSucesso ?? false;
  if (!ok || (result.registrosAfetados !== undefined && result.registrosAfetados === 0)) {
    const msg = result.mensagem || `Falha ao ${operation} — nenhum registro afetado`;
    logger.error({ result, operation }, `[ApontamentoMutation] ${operation} FAILED silently`);
    throw new Error(msg);
  }
}

export interface CreateApontamentoInput {
  CODVEICULO: number;
  CODUSU: number;
  KM?: number | null;
  HORIMETRO?: number | null;
  TAG?: string | null;
  OBS?: string | null;
  BORRCHARIA?: string | null;
  ELETRICA?: string | null;
  FUNILARIA?: string | null;
  MECANICA?: string | null;
  CALDEIRARIA?: string | null;
  OSEXTERNA?: string | null;
  OPEXTERNO?: string | null;
  DTPROGRAMACAO?: string | null;
}

export interface UpdateApontamentoInput {
  CODVEICULO?: number;
  KM?: number | null;
  HORIMETRO?: number | null;
  TAG?: string | null;
  OBS?: string | null;
  BORRCHARIA?: string | null;
  ELETRICA?: string | null;
  FUNILARIA?: string | null;
  MECANICA?: string | null;
  CALDEIRARIA?: string | null;
  OSEXTERNA?: string | null;
  OPEXTERNO?: string | null;
  DTPROGRAMACAO?: string | null;
}

export interface AddServicoInput {
  DESCRITIVO?: string | null;
  CODPROD?: number | null;
  QTD?: number | null;
  GERAOS?: string | null;
  HR?: number | null;
  KM?: number | null;
  DTPROGRAMACAO?: string | null;
}

export interface UpdateServicoInput {
  DESCRITIVO?: string | null;
  CODPROD?: number | null;
  QTD?: number | null;
  GERAOS?: string | null;
  HR?: number | null;
  KM?: number | null;
  DTPROGRAMACAO?: string | null;
}

export class ApontamentoMutationService {
  private me: MutationExecutor;
  private qe: QueryExecutor;

  constructor() {
    this.me = new MutationExecutor();
    this.qe = new QueryExecutor();
  }

  async createApontamento(input: CreateApontamentoInput, userToken?: string) {
    assertNotProd('criar apontamento');
    if (!input.CODVEICULO || input.CODVEICULO <= 0) {
      throw new ValidationError('CODVEICULO must be a positive number');
    }
    if (!input.CODUSU || input.CODUSU <= 0) {
      throw new ValidationError('CODUSU must be a positive number');
    }

    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const dados: Record<string, unknown> = {
      CODVEICULO: input.CODVEICULO,
      CODUSU: input.CODUSU,
      DTINCLUSAO: now,
    };

    if (input.KM !== undefined) dados.KM = input.KM;
    if (input.HORIMETRO !== undefined) dados.HORIMETRO = input.HORIMETRO;
    if (input.TAG !== undefined) dados.TAG = input.TAG;
    if (input.OBS !== undefined) dados.OBS = input.OBS;
    if (input.BORRCHARIA !== undefined) dados.BORRCHARIA = input.BORRCHARIA;
    if (input.ELETRICA !== undefined) dados.ELETRICA = input.ELETRICA;
    if (input.FUNILARIA !== undefined) dados.FUNILARIA = input.FUNILARIA;
    if (input.MECANICA !== undefined) dados.MECANICA = input.MECANICA;
    if (input.CALDEIRARIA !== undefined) dados.CALDEIRARIA = input.CALDEIRARIA;
    if (input.OSEXTERNA !== undefined) dados.OSEXTERNA = input.OSEXTERNA;
    if (input.OPEXTERNO !== undefined) dados.OPEXTERNO = input.OPEXTERNO;
    if (input.DTPROGRAMACAO !== undefined) dados.DTPROGRAMACAO = input.DTPROGRAMACAO;

    const result = await this.me.insert('AD_APONTAMENTO', dados, { userToken });
    assertMutationSuccess(result, 'criar apontamento');
    bustCache();
    return result;
  }

  async updateApontamento(codigo: number, input: UpdateApontamentoInput, userToken?: string) {
    assertNotProd('atualizar apontamento');
    if (!codigo || codigo <= 0) {
      throw new ValidationError('CODIGO must be a positive number');
    }

    const dadosNovos: Record<string, unknown> = {};

    if (input.CODVEICULO !== undefined) dadosNovos.CODVEICULO = input.CODVEICULO;
    if (input.KM !== undefined) dadosNovos.KM = input.KM;
    if (input.HORIMETRO !== undefined) dadosNovos.HORIMETRO = input.HORIMETRO;
    if (input.TAG !== undefined) dadosNovos.TAG = input.TAG;
    if (input.OBS !== undefined) dadosNovos.OBS = input.OBS;
    if (input.BORRCHARIA !== undefined) dadosNovos.BORRCHARIA = input.BORRCHARIA;
    if (input.ELETRICA !== undefined) dadosNovos.ELETRICA = input.ELETRICA;
    if (input.FUNILARIA !== undefined) dadosNovos.FUNILARIA = input.FUNILARIA;
    if (input.MECANICA !== undefined) dadosNovos.MECANICA = input.MECANICA;
    if (input.CALDEIRARIA !== undefined) dadosNovos.CALDEIRARIA = input.CALDEIRARIA;
    if (input.OSEXTERNA !== undefined) dadosNovos.OSEXTERNA = input.OSEXTERNA;
    if (input.OPEXTERNO !== undefined) dadosNovos.OPEXTERNO = input.OPEXTERNO;
    if (input.DTPROGRAMACAO !== undefined) dadosNovos.DTPROGRAMACAO = input.DTPROGRAMACAO;

    const result = await this.me.update(
      'AD_APONTAMENTO', { CODIGO: codigo }, dadosNovos, { userToken },
    );
    assertMutationSuccess(result, 'atualizar apontamento');
    bustCache();
    return result;
  }

  async deleteApontamento(codigo: number, userToken?: string) {
    assertNotProd('excluir apontamento');
    if (!codigo || codigo <= 0) {
      throw new ValidationError('CODIGO must be a positive number');
    }

    // Delete child services in batches first (API Mother max limiteRegistros = 10)
    const MAX_BATCH = API_MOTHER_MAX_BATCH_SIZE;
    const MAX_ITERATIONS = API_MOTHER_MAX_ITERATIONS_SAFETY;
    for (let i = 0; i < MAX_ITERATIONS; i++) {
      const res = await this.me.delete(
        'AD_APONTSOL', { CODIGO: codigo }, { limiteRegistros: MAX_BATCH, userToken },
      );
      if (res.sucesso === false && res.foiSucesso === false) {
        throw new Error(res.mensagem || 'Falha ao excluir servicos do apontamento');
      }
      if (!res.registrosAfetados || res.registrosAfetados < MAX_BATCH) break;
    }

    // Then delete the header
    const result = await this.me.delete(
      'AD_APONTAMENTO', { CODIGO: codigo }, { userToken },
    );
    assertMutationSuccess(result, 'excluir apontamento');
    bustCache();
    return result;
  }

  async addServico(codigo: number, input: AddServicoInput, userToken?: string) {
    assertNotProd('adicionar servico');
    if (!codigo || codigo <= 0) {
      throw new ValidationError('CODIGO must be a positive number');
    }

    // Get next SEQ number
    const sql = nextSeqSql.replace('@codigo', String(codigo));
    const rows = await this.qe.executeQuery<{ nextSeq: number }>(sql);
    const nextSeqVal = rows[0]?.nextSeq ?? 1;

    const dados: Record<string, unknown> = {
      CODIGO: codigo,
      SEQ: nextSeqVal,
    };

    if (input.DESCRITIVO !== undefined) dados.DESCRITIVO = input.DESCRITIVO;
    if (input.CODPROD !== undefined) dados.CODPROD = input.CODPROD;
    if (input.QTD !== undefined) dados.QTD = input.QTD;
    if (input.GERAOS !== undefined) dados.GERAOS = input.GERAOS;
    if (input.HR !== undefined) dados.HR = input.HR;
    if (input.KM !== undefined) dados.KM = input.KM;
    if (input.DTPROGRAMACAO !== undefined) dados.DTPROGRAMACAO = input.DTPROGRAMACAO;

    const result = await this.me.insert('AD_APONTSOL', dados, { userToken });
    assertMutationSuccess(result, 'adicionar servico');
    bustCache();
    return result;
  }

  async updateServico(codigo: number, seq: number, input: UpdateServicoInput, userToken?: string) {
    assertNotProd('atualizar servico');
    if (!codigo || codigo <= 0) {
      throw new ValidationError('CODIGO must be a positive number');
    }
    if (!seq || seq <= 0) {
      throw new ValidationError('SEQ must be a positive number');
    }

    const dadosNovos: Record<string, unknown> = {};

    if (input.DESCRITIVO !== undefined) dadosNovos.DESCRITIVO = input.DESCRITIVO;
    if (input.CODPROD !== undefined) dadosNovos.CODPROD = input.CODPROD;
    if (input.QTD !== undefined) dadosNovos.QTD = input.QTD;
    if (input.GERAOS !== undefined) dadosNovos.GERAOS = input.GERAOS;
    if (input.HR !== undefined) dadosNovos.HR = input.HR;
    if (input.KM !== undefined) dadosNovos.KM = input.KM;
    if (input.DTPROGRAMACAO !== undefined) dadosNovos.DTPROGRAMACAO = input.DTPROGRAMACAO;

    const result = await this.me.update(
      'AD_APONTSOL', { CODIGO: codigo, SEQ: seq }, dadosNovos, { userToken },
    );
    assertMutationSuccess(result, 'atualizar servico');
    bustCache();
    return result;
  }

  async deleteServico(codigo: number, seq: number, userToken?: string) {
    assertNotProd('excluir servico');
    if (!codigo || codigo <= 0) {
      throw new ValidationError('CODIGO must be a positive number');
    }
    if (!seq || seq <= 0) {
      throw new ValidationError('SEQ must be a positive number');
    }

    const result = await this.me.delete(
      'AD_APONTSOL', { CODIGO: codigo, SEQ: seq }, { userToken },
    );
    assertMutationSuccess(result, 'excluir servico');
    bustCache();
    return result;
  }
}
