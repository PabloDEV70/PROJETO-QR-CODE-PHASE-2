import { MutationExecutor } from '../../infra/api-mother/mutationExecutor';
import { ValidationError } from '../errors/app-error';
import { cache } from '../../shared/cache';
import { QueryExecutor } from '../../infra/api-mother/queryExecutor';
import { nextItem as nextItemSql } from '../../sql-queries/AD_RDOAPONDETALHES/next-item';
import { logger } from '../../shared/logger';
import { escapeSqlDate } from '../../shared/sql-sanitize';
import { API_MOTHER_MAX_BATCH_SIZE, API_MOTHER_MAX_ITERATIONS_SAFETY } from '../../shared/constants/api-mother';

function bustCache() {
  cache.deleteByPrefix('rdo:');
}

/** Validate API Mother result — throw if mutation failed silently (HTTP 200, sucesso: false) */
function assertMutationSuccess(
  result: { sucesso?: boolean; foiSucesso?: boolean; registrosAfetados?: number; mensagem?: string },
  operation: string,
) {
  const ok = result.sucesso ?? result.foiSucesso ?? false;
  if (!ok || (result.registrosAfetados !== undefined && result.registrosAfetados === 0)) {
    const msg = result.mensagem || `Falha ao ${operation} — nenhum registro afetado`;
    logger.error({ result, operation }, `[RdoMutation] ${operation} FAILED silently`);
    throw new Error(msg);
  }
}

export interface CreateRdoInput {
  CODPARC: number;
  DTREF: string;
}

export interface UpdateRdoInput {
  DTREF?: string;
  CODPARC?: number;
}

export interface AddDetalheInput {
  HRINI: number;
  HRFIM: number;
  RDOMOTIVOCOD: number;
  NUOS?: number | null;
  AD_SEQUENCIA_OS?: number | null;
  CODVEICULO?: number | null;
  OBS?: string | null;
}

export interface UpdateDetalheInput {
  HRINI?: number;
  HRFIM?: number;
  RDOMOTIVOCOD?: number;
  NUOS?: number | null;
  AD_SEQUENCIA_OS?: number | null;
  CODVEICULO?: number | null;
  OBS?: string | null;
}

export class RdoMutationService {
  private me: MutationExecutor;
  private qe: QueryExecutor;

  constructor() {
    this.me = new MutationExecutor();
    this.qe = new QueryExecutor();
  }

  async createRdo(input: CreateRdoInput, userToken?: string) {
    if (!input.CODPARC || input.CODPARC <= 0) {
      throw new ValidationError('CODPARC must be a positive number');
    }
    if (!input.DTREF?.trim()) {
      throw new ValidationError('DTREF is required');
    }

    // Duplicate check: only one RDO per CODPARC per DTREF
    const dtref = escapeSqlDate(input.DTREF.trim());
    const existing = await this.qe.executeQuery<{ CODRDO: number }>(
      `SELECT TOP 1 CODRDO FROM AD_RDOAPONTAMENTOS WHERE CODPARC = ${Number(input.CODPARC)} AND DTREF = '${dtref}'`,
    );
    if (existing.length > 0) {
      return { codrdo: existing[0]!.CODRDO, duplicateAvoided: true };
    }

    const now = new Date().toISOString();
    const dados: Record<string, unknown> = {
      CODPARC: input.CODPARC,
      DTREF: dtref,
      DTINC: now,
    };

    const result = await this.me.insert('AD_RDOAPONTAMENTOS', dados, { userToken });
    assertMutationSuccess(result, 'criar RDO');
    bustCache();
    return result;
  }

  async updateRdo(codrdo: number, input: UpdateRdoInput, userToken?: string) {
    if (!codrdo || codrdo <= 0) {
      throw new ValidationError('CODRDO must be a positive number');
    }

    const dadosNovos: Record<string, unknown> = {
      DTALT: new Date().toISOString(),
    };

    if (input.DTREF !== undefined) dadosNovos.DTREF = input.DTREF;
    if (input.CODPARC !== undefined) dadosNovos.CODPARC = input.CODPARC;

    const result = await this.me.update(
      'AD_RDOAPONTAMENTOS', { CODRDO: codrdo }, dadosNovos, { userToken },
    );
    assertMutationSuccess(result, 'atualizar RDO');
    bustCache();
    return result;
  }

  async deleteRdo(codrdo: number, userToken?: string) {
    if (!codrdo || codrdo <= 0) {
      throw new ValidationError('CODRDO must be a positive number');
    }

    // Delete detail items in batches (API Mother max limiteRegistros = 10)
    const MAX_BATCH = API_MOTHER_MAX_BATCH_SIZE;
    const MAX_ITERATIONS = API_MOTHER_MAX_ITERATIONS_SAFETY; // safety: max 200 details
    for (let i = 0; i < MAX_ITERATIONS; i++) {
      const res = await this.me.delete(
        'AD_RDOAPONDETALHES', { CODRDO: codrdo }, { limiteRegistros: MAX_BATCH, userToken },
      );
      if (res.sucesso === false && res.foiSucesso === false) {
        throw new Error(res.mensagem || 'Falha ao excluir detalhes do RDO');
      }
      if (!res.registrosAfetados || res.registrosAfetados < MAX_BATCH) break;
    }

    // Then delete the header
    const result = await this.me.delete(
      'AD_RDOAPONTAMENTOS', { CODRDO: codrdo }, { userToken },
    );
    assertMutationSuccess(result, 'excluir RDO');
    bustCache();
    return result;
  }

  async addDetalhe(codrdo: number, input: AddDetalheInput, userToken?: string) {
    if (!codrdo || codrdo <= 0) {
      throw new ValidationError('CODRDO must be a positive number');
    }
    if (input.HRINI === undefined || input.HRINI === null) {
      throw new ValidationError('HRINI is required');
    }
    if (input.HRFIM === undefined || input.HRFIM === null) {
      throw new ValidationError('HRFIM is required');
    }
    if (!input.RDOMOTIVOCOD) {
      throw new ValidationError('RDOMOTIVOCOD is required');
    }

    // Get next ITEM number
    const sql = nextItemSql.replace('@codrdo', String(codrdo));
    const rows = await this.qe.executeQuery<{ nextItem: number }>(sql);
    const nextItemVal = rows[0]?.nextItem ?? 1;

    const now = new Date().toISOString();
    const dados: Record<string, unknown> = {
      CODRDO: codrdo,
      ITEM: nextItemVal,
      HRINI: input.HRINI,
      HRFIM: input.HRFIM,
      RDOMOTIVOCOD: input.RDOMOTIVOCOD,
      DTINC: now,
    };

    if (input.NUOS !== undefined) dados.NUOS = input.NUOS;
    if (input.AD_SEQUENCIA_OS !== undefined) dados.AD_SEQUENCIA_OS = input.AD_SEQUENCIA_OS;
    if (input.CODVEICULO !== undefined) dados.CODVEICULO = input.CODVEICULO;
    if (input.OBS !== undefined) dados.OBS = input.OBS;

    const result = await this.me.insert('AD_RDOAPONDETALHES', dados, { userToken });
    assertMutationSuccess(result, 'adicionar atividade');
    bustCache();
    return result;
  }

  async updateDetalhe(codrdo: number, item: number, input: UpdateDetalheInput, userToken?: string) {
    if (!codrdo || codrdo <= 0) {
      throw new ValidationError('CODRDO must be a positive number');
    }
    if (!item || item <= 0) {
      throw new ValidationError('ITEM must be a positive number');
    }

    const dadosNovos: Record<string, unknown> = {
      DTALT: new Date().toISOString(),
    };

    if (input.HRINI !== undefined) dadosNovos.HRINI = input.HRINI;
    if (input.HRFIM !== undefined) dadosNovos.HRFIM = input.HRFIM;
    if (input.RDOMOTIVOCOD !== undefined) dadosNovos.RDOMOTIVOCOD = input.RDOMOTIVOCOD;
    if (input.NUOS !== undefined) dadosNovos.NUOS = input.NUOS;
    if (input.AD_SEQUENCIA_OS !== undefined) dadosNovos.AD_SEQUENCIA_OS = input.AD_SEQUENCIA_OS;
    if (input.CODVEICULO !== undefined) dadosNovos.CODVEICULO = input.CODVEICULO;
    if (input.OBS !== undefined) dadosNovos.OBS = input.OBS;

    const result = await this.me.update(
      'AD_RDOAPONDETALHES', { CODRDO: codrdo, ITEM: item }, dadosNovos, { userToken },
    );
    assertMutationSuccess(result, 'atualizar atividade');
    bustCache();
    return result;
  }

  async deleteDetalhe(codrdo: number, item: number, userToken?: string) {
    if (!codrdo || codrdo <= 0) {
      throw new ValidationError('CODRDO must be a positive number');
    }
    if (!item || item <= 0) {
      throw new ValidationError('ITEM must be a positive number');
    }

    const result = await this.me.delete(
      'AD_RDOAPONDETALHES', { CODRDO: codrdo, ITEM: item }, { userToken },
    );
    assertMutationSuccess(result, 'excluir atividade');
    bustCache();
    return result;
  }
}
