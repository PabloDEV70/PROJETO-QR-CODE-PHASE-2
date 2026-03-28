import { MutationExecutor } from '../../infra/api-mother/mutationExecutor';
import { ValidationError } from '../errors/app-error';
import { cache } from '../../shared/cache';
import { logger } from '../../shared/logger';

function bustCorridasCache() {
  cache.deleteByPrefix('corridas:');
}

function assertMutationSuccess(
  result: { sucesso?: boolean; foiSucesso?: boolean; registrosAfetados?: number; mensagem?: string },
  operation: string,
) {
  const ok = result.sucesso ?? result.foiSucesso ?? false;
  if (!ok || (result.registrosAfetados !== undefined && result.registrosAfetados === 0)) {
    const msg = result.mensagem || `Falha ao ${operation} — nenhum registro afetado`;
    logger.error({ result, operation }, `[CorridasMutation] ${operation} FAILED silently`);
    throw new Error(msg);
  }
}

export interface CreateCorridaInput {
  USU_SOLICITANTE: number;
  CODPARC?: number;
  DESTINO?: string;
  BUSCARLEVAR?: string;
  PASSAGEIROSMERCADORIA?: string;
  OBS?: string;
  PRIORIDADE?: string;
  DT_ACIONAMENTO?: string;
  ENVIAWPP?: string;
}

export interface UpdateCorridaInput {
  USU_SOLICITANTE?: number;
  USU_MOTORISTA?: number;
  CODPARC?: number;
  DESTINO?: string;
  BUSCARLEVAR?: string;
  PASSAGEIROSMERCADORIA?: string;
  OBS?: string;
  PRIORIDADE?: string;
  DT_ACIONAMENTO?: string;
  STATUS?: string;
  ENVIAWPP?: string;
}

export class CorridasMutationService {
  private me: MutationExecutor;

  constructor() {
    this.me = new MutationExecutor();
  }

  async createCorrida(input: CreateCorridaInput, userToken?: string) {
    if (!input.USU_SOLICITANTE) {
      throw new ValidationError('USU_SOLICITANTE is required');
    }

    const now = new Date().toISOString();
    const dados: Record<string, unknown> = {
      USU_SOLICITANTE: input.USU_SOLICITANTE,
      STATUS: '0',
      DT_CREATED: now,
      DT_UPDATED: now,
    };

    if (input.CODPARC) dados.CODPARC = input.CODPARC;
    if (input.DESTINO) dados.DESTINO = input.DESTINO.trim();
    if (input.BUSCARLEVAR) dados.BUSCARLEVAR = input.BUSCARLEVAR;
    if (input.PASSAGEIROSMERCADORIA) dados.PASSAGEIROSMERCADORIA = input.PASSAGEIROSMERCADORIA.trim();
    if (input.OBS) dados.OBS = input.OBS.trim();
    if (input.PRIORIDADE) dados.PRIORIDADE = input.PRIORIDADE;
    if (input.DT_ACIONAMENTO) dados.DT_ACIONAMENTO = input.DT_ACIONAMENTO;
    if (input.ENVIAWPP) dados.ENVIAWPP = input.ENVIAWPP;

    const result = await this.me.insert('AD_CHAMADOSCORRIDAS', dados, { userToken });
    assertMutationSuccess(result, 'criar corrida');
    bustCorridasCache();
    return result;
  }

  async updateCorrida(id: number, input: UpdateCorridaInput, userToken?: string) {
    if (!id || id <= 0) {
      throw new ValidationError('ID must be a positive number');
    }

    const dadosNovos: Record<string, unknown> = {
      DT_UPDATED: new Date().toISOString(),
    };

    if (input.USU_SOLICITANTE !== undefined) dadosNovos.USU_SOLICITANTE = input.USU_SOLICITANTE;
    if (input.USU_MOTORISTA !== undefined) dadosNovos.USU_MOTORISTA = input.USU_MOTORISTA;
    if (input.CODPARC !== undefined) dadosNovos.CODPARC = input.CODPARC;
    if (input.DESTINO !== undefined) dadosNovos.DESTINO = input.DESTINO.trim();
    if (input.BUSCARLEVAR !== undefined) dadosNovos.BUSCARLEVAR = input.BUSCARLEVAR;
    if (input.PASSAGEIROSMERCADORIA !== undefined) dadosNovos.PASSAGEIROSMERCADORIA = input.PASSAGEIROSMERCADORIA.trim();
    if (input.OBS !== undefined) dadosNovos.OBS = input.OBS.trim();
    if (input.PRIORIDADE !== undefined) dadosNovos.PRIORIDADE = input.PRIORIDADE;
    if (input.DT_ACIONAMENTO !== undefined) dadosNovos.DT_ACIONAMENTO = input.DT_ACIONAMENTO;
    if (input.STATUS !== undefined) dadosNovos.STATUS = input.STATUS;
    if (input.ENVIAWPP !== undefined) dadosNovos.ENVIAWPP = input.ENVIAWPP;

    const result = await this.me.update(
      'AD_CHAMADOSCORRIDAS', { ID: id }, dadosNovos, { userToken },
    );
    assertMutationSuccess(result, 'atualizar corrida');
    bustCorridasCache();
    return result;
  }

  async updateStatus(id: number, status: string, codUsu?: number, userToken?: string) {
    const validStatuses = ['0', '1', '2', '3'];
    if (!validStatuses.includes(status)) {
      throw new ValidationError(`Invalid status: ${status}. Valid: ${validStatuses.join(', ')}`);
    }

    const now = new Date().toISOString();
    const dadosNovos: Record<string, unknown> = {
      STATUS: status,
      DT_UPDATED: now,
    };

    if (codUsu) {
      dadosNovos.USER_ID = codUsu;
    }

    if (status === '2' || status === '3') {
      dadosNovos.DT_FINISHED = now;
    }

    const result = await this.me.update(
      'AD_CHAMADOSCORRIDAS', { ID: id }, dadosNovos, { userToken },
    );
    assertMutationSuccess(result, 'alterar status corrida');
    bustCorridasCache();
    return result;
  }

  async assignMotorista(id: number, codUsu: number, userToken?: string) {
    if (!id || id <= 0) {
      throw new ValidationError('ID must be a positive number');
    }
    if (!codUsu || codUsu <= 0) {
      throw new ValidationError('codUsu must be a positive number');
    }

    const now = new Date().toISOString();
    const dadosNovos: Record<string, unknown> = {
      USU_MOTORISTA: codUsu,
      STATUS: '1',
      DT_UPDATED: now,
    };

    const result = await this.me.update(
      'AD_CHAMADOSCORRIDAS', { ID: id }, dadosNovos, { userToken },
    );
    assertMutationSuccess(result, 'atribuir motorista');
    bustCorridasCache();
    return result;
  }
}
