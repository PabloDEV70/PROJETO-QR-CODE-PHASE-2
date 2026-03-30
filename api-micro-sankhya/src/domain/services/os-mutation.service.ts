import { MutationExecutor } from '../../infra/api-mother/mutationExecutor';
import { ValidationError } from '../errors/app-error';
import { cache } from '../../shared/cache';
import { QueryExecutor } from '../../infra/api-mother/queryExecutor';
import { nextSequencia as nextSequenciaSql } from '../../sql-queries/TCFSERVOS/next-sequencia';
import { logger } from '../../shared/logger';

function bustCache() {
  cache.deleteByPrefix('os:');
}

/** Validate API Mother result — throw if mutation failed silently (HTTP 200, sucesso: false) */
function assertMutationSuccess(
  result: { sucesso?: boolean; foiSucesso?: boolean; registrosAfetados?: number; mensagem?: string },
  operation: string,
) {
  const ok = result.sucesso ?? result.foiSucesso ?? false;
  if (!ok || (result.registrosAfetados !== undefined && result.registrosAfetados === 0)) {
    const msg = result.mensagem || `Falha ao ${operation} — nenhum registro afetado`;
    logger.error({ result, operation }, `[OsMutation] ${operation} FAILED silently`);
    throw new Error(msg);
  }
}

function nowDatetime(): string {
  return new Date().toISOString().slice(0, 19).replace('T', ' ');
}

const VALID_STATUS_TRANSITIONS: Record<string, string[]> = {
  A: ['E', 'C'],
  E: ['F', 'A', 'C'],
  F: ['A'],
  C: ['A'],
};

export interface CreateOsInput {
  CODVEICULO: number;
  MANUTENCAO: string;
  TIPO: string;
  CODPARC?: number | null;
  CODMOTORISTA?: number | null;
  PREVISAO?: string | null;
  KM?: number | null;
  HORIMETRO?: number | null;
  NUPLANO?: number | null;
  AD_STATUSGIG?: string | null;
  CODEMP?: number | null;
  CODCENCUS?: number | null;
}

export interface UpdateOsInput {
  CODVEICULO?: number;
  CODPARC?: number | null;
  CODMOTORISTA?: number | null;
  MANUTENCAO?: string;
  TIPO?: string;
  PREVISAO?: string | null;
  KM?: number | null;
  HORIMETRO?: number | null;
  NUPLANO?: number | null;
  AD_STATUSGIG?: string | null;
  AD_LOCALMANUTENCAO?: string | null;
  AD_BLOQUEIOS?: string | null;
  CODEMP?: number | null;
}

export interface ChangeStatusInput {
  STATUS: string;
  AD_STATUSGIG?: string | null;
}

export interface AddServicoInput {
  CODPROD: number;
  QTD?: number | null;
  VLRUNIT?: number | null;
  VLRTOT?: number | null;
  TEMPO?: number | null;
  OBSERVACAO?: string | null;
}

export interface UpdateServicoInput {
  CODPROD?: number;
  QTD?: number | null;
  VLRUNIT?: number | null;
  VLRTOT?: number | null;
  TEMPO?: number | null;
  OBSERVACAO?: string | null;
}

export class OsMutationService {
  private me: MutationExecutor;
  private qe: QueryExecutor;

  constructor() {
    this.me = new MutationExecutor();
    this.qe = new QueryExecutor();
  }

  async createOs(input: CreateOsInput, userToken?: string) {
    if (!input.CODVEICULO || input.CODVEICULO <= 0) {
      throw new ValidationError('CODVEICULO must be a positive number');
    }
    if (!input.MANUTENCAO?.trim()) {
      throw new ValidationError('MANUTENCAO is required');
    }
    if (!input.TIPO?.trim()) {
      throw new ValidationError('TIPO is required');
    }

    const dados: Record<string, unknown> = {
      CODVEICULO: input.CODVEICULO,
      MANUTENCAO: input.MANUTENCAO.trim(),
      TIPO: input.TIPO.trim(),
      STATUS: 'A',
      DTABERTURA: nowDatetime(),
    };

    if (input.CODPARC !== undefined) dados.CODPARC = input.CODPARC;
    if (input.CODMOTORISTA !== undefined) dados.CODMOTORISTA = input.CODMOTORISTA;
    if (input.PREVISAO !== undefined) dados.PREVISAO = input.PREVISAO;
    if (input.KM !== undefined) dados.KM = input.KM;
    if (input.HORIMETRO !== undefined) dados.HORIMETRO = input.HORIMETRO;
    if (input.NUPLANO !== undefined) dados.NUPLANO = input.NUPLANO;
    if (input.AD_STATUSGIG !== undefined) dados.AD_STATUSGIG = input.AD_STATUSGIG;
    if (input.CODEMP !== undefined) dados.CODEMP = input.CODEMP;
    if (input.CODCENCUS !== undefined) dados.CODCENCUS = input.CODCENCUS;

    const result = await this.me.insert('TCFOSCAB', dados, { userToken });
    assertMutationSuccess(result, 'criar OS');
    bustCache();
    return result;
  }

  async updateOs(nuos: number, input: UpdateOsInput, userToken?: string) {
    if (!nuos || nuos <= 0) {
      throw new ValidationError('NUOS must be a positive number');
    }

    const dadosNovos: Record<string, unknown> = {};

    if (input.CODVEICULO !== undefined) dadosNovos.CODVEICULO = input.CODVEICULO;
    if (input.CODPARC !== undefined) dadosNovos.CODPARC = input.CODPARC;
    if (input.CODMOTORISTA !== undefined) dadosNovos.CODMOTORISTA = input.CODMOTORISTA;
    if (input.MANUTENCAO !== undefined) dadosNovos.MANUTENCAO = input.MANUTENCAO;
    if (input.TIPO !== undefined) dadosNovos.TIPO = input.TIPO;
    if (input.PREVISAO !== undefined) dadosNovos.PREVISAO = input.PREVISAO;
    if (input.KM !== undefined) dadosNovos.KM = input.KM;
    if (input.HORIMETRO !== undefined) dadosNovos.HORIMETRO = input.HORIMETRO;
    if (input.NUPLANO !== undefined) dadosNovos.NUPLANO = input.NUPLANO;
    if (input.AD_STATUSGIG !== undefined) dadosNovos.AD_STATUSGIG = input.AD_STATUSGIG;
    if (input.AD_LOCALMANUTENCAO !== undefined) dadosNovos.AD_LOCALMANUTENCAO = input.AD_LOCALMANUTENCAO;
    if (input.AD_BLOQUEIOS !== undefined) dadosNovos.AD_BLOQUEIOS = input.AD_BLOQUEIOS;
    if (input.CODEMP !== undefined) dadosNovos.CODEMP = input.CODEMP;

    const result = await this.me.update(
      'TCFOSCAB', { NUOS: nuos }, dadosNovos, { userToken },
    );
    assertMutationSuccess(result, 'atualizar OS');
    bustCache();
    return result;
  }

  async changeStatus(nuos: number, input: ChangeStatusInput, userToken?: string) {
    if (!nuos || nuos <= 0) {
      throw new ValidationError('NUOS must be a positive number');
    }
    if (!input.STATUS?.trim()) {
      throw new ValidationError('STATUS is required');
    }

    // Get current status to validate transition
    const rows = await this.qe.executeQuery<{ STATUS: string }>(
      `SELECT TOP 1 STATUS FROM TCFOSCAB WHERE NUOS = ${Number(nuos)}`,
    );
    if (rows.length === 0) {
      throw new ValidationError(`OS ${nuos} not found`);
    }

    const currentStatus = rows[0]!.STATUS;
    const allowed = VALID_STATUS_TRANSITIONS[currentStatus];
    if (!allowed || !allowed.includes(input.STATUS)) {
      throw new ValidationError(
        `Invalid status transition: ${currentStatus} → ${input.STATUS}. Allowed: ${allowed?.join(', ') ?? 'none'}`,
      );
    }

    const dadosNovos: Record<string, unknown> = {
      STATUS: input.STATUS,
      AD_DHALTERSTATUS: nowDatetime(),
    };

    if (input.AD_STATUSGIG !== undefined) dadosNovos.AD_STATUSGIG = input.AD_STATUSGIG;

    const result = await this.me.update(
      'TCFOSCAB', { NUOS: nuos }, dadosNovos, { userToken },
    );
    assertMutationSuccess(result, 'alterar status OS');
    bustCache();
    return result;
  }

  async finalizeOs(nuos: number, userToken?: string) {
    if (!nuos || nuos <= 0) {
      throw new ValidationError('NUOS must be a positive number');
    }

    // Validate: current status must be 'E'
    const rows = await this.qe.executeQuery<{ STATUS: string }>(
      `SELECT TOP 1 STATUS FROM TCFOSCAB WHERE NUOS = ${Number(nuos)}`,
    );
    if (rows.length === 0) {
      throw new ValidationError(`OS ${nuos} not found`);
    }
    if (rows[0]!.STATUS !== 'E') {
      throw new ValidationError(`Cannot finalize OS with status '${rows[0]!.STATUS}'. Must be 'E' (Em Execucao)`);
    }

    const dadosNovos: Record<string, unknown> = {
      STATUS: 'F',
      DATAFIN: nowDatetime(),
      AD_DHALTERSTATUS: nowDatetime(),
    };

    const result = await this.me.update(
      'TCFOSCAB', { NUOS: nuos }, dadosNovos, { userToken },
    );
    assertMutationSuccess(result, 'finalizar OS');
    bustCache();
    return result;
  }

  async cancelOs(nuos: number, userToken?: string) {
    if (!nuos || nuos <= 0) {
      throw new ValidationError('NUOS must be a positive number');
    }

    const dadosNovos: Record<string, unknown> = {
      STATUS: 'C',
      AD_DHALTERSTATUS: nowDatetime(),
    };

    const result = await this.me.update(
      'TCFOSCAB', { NUOS: nuos }, dadosNovos, { userToken },
    );
    assertMutationSuccess(result, 'cancelar OS');
    bustCache();
    return result;
  }

  async reopenOs(nuos: number, userToken?: string) {
    if (!nuos || nuos <= 0) {
      throw new ValidationError('NUOS must be a positive number');
    }

    const dadosNovos: Record<string, unknown> = {
      STATUS: 'A',
      DATAFIN: null,
      AD_DHALTERSTATUS: nowDatetime(),
    };

    const result = await this.me.update(
      'TCFOSCAB', { NUOS: nuos }, dadosNovos, { userToken },
    );
    assertMutationSuccess(result, 'reabrir OS');
    bustCache();
    return result;
  }

  async addServico(nuos: number, input: AddServicoInput, userToken?: string) {
    if (!nuos || nuos <= 0) {
      throw new ValidationError('NUOS must be a positive number');
    }
    if (!input.CODPROD || input.CODPROD <= 0) {
      throw new ValidationError('CODPROD must be a positive number');
    }

    // Get next SEQUENCIA number
    const sql = nextSequenciaSql.replace('@nuos', String(nuos));
    const rows = await this.qe.executeQuery<{ nextSequencia: number }>(sql);
    const nextSeqVal = rows[0]?.nextSequencia ?? 1;

    const dados: Record<string, unknown> = {
      NUOS: nuos,
      SEQUENCIA: nextSeqVal,
      CODPROD: input.CODPROD,
    };

    if (input.QTD !== undefined) dados.QTD = input.QTD;
    if (input.VLRUNIT !== undefined) dados.VLRUNIT = input.VLRUNIT;
    if (input.VLRTOT !== undefined) dados.VLRTOT = input.VLRTOT;
    if (input.TEMPO !== undefined) dados.TEMPO = input.TEMPO;
    if (input.OBSERVACAO !== undefined) dados.OBSERVACAO = input.OBSERVACAO;

    const result = await this.me.insert('TCFSERVOS', dados, { userToken });
    assertMutationSuccess(result, 'adicionar servico');
    bustCache();
    return result;
  }

  async updateServico(nuos: number, sequencia: number, input: UpdateServicoInput, userToken?: string) {
    if (!nuos || nuos <= 0) {
      throw new ValidationError('NUOS must be a positive number');
    }
    if (!sequencia || sequencia <= 0) {
      throw new ValidationError('SEQUENCIA must be a positive number');
    }

    const dadosNovos: Record<string, unknown> = {};

    if (input.CODPROD !== undefined) dadosNovos.CODPROD = input.CODPROD;
    if (input.QTD !== undefined) dadosNovos.QTD = input.QTD;
    if (input.VLRUNIT !== undefined) dadosNovos.VLRUNIT = input.VLRUNIT;
    if (input.VLRTOT !== undefined) dadosNovos.VLRTOT = input.VLRTOT;
    if (input.TEMPO !== undefined) dadosNovos.TEMPO = input.TEMPO;
    if (input.OBSERVACAO !== undefined) dadosNovos.OBSERVACAO = input.OBSERVACAO;

    const result = await this.me.update(
      'TCFSERVOS', { NUOS: nuos, SEQUENCIA: sequencia }, dadosNovos, { userToken },
    );
    assertMutationSuccess(result, 'atualizar servico');
    bustCache();
    return result;
  }

  async deleteServico(nuos: number, sequencia: number, userToken?: string) {
    if (!nuos || nuos <= 0) {
      throw new ValidationError('NUOS must be a positive number');
    }
    if (!sequencia || sequencia <= 0) {
      throw new ValidationError('SEQUENCIA must be a positive number');
    }

    const result = await this.me.delete(
      'TCFSERVOS', { NUOS: nuos, SEQUENCIA: sequencia }, { userToken },
    );
    assertMutationSuccess(result, 'excluir servico');
    bustCache();
    return result;
  }
}
