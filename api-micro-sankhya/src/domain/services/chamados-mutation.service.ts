import { MutationExecutor } from '../../infra/api-mother/mutationExecutor';
import { ValidationError } from '../errors/app-error';
import { cache } from '../../shared/cache';
import { logger } from '../../shared/logger';

function bustChamadosCache() {
  cache.deleteByPrefix('chamados:');
}

function assertMutationSuccess(
  result: { sucesso?: boolean; foiSucesso?: boolean; registrosAfetados?: number; mensagem?: string },
  operation: string,
) {
  const ok = result.sucesso ?? result.foiSucesso ?? false;
  if (!ok || (result.registrosAfetados !== undefined && result.registrosAfetados === 0)) {
    const msg = result.mensagem || `Falha ao ${operation} — nenhum registro afetado`;
    logger.error({ result, operation }, `[ChamadosMutation] ${operation} FAILED silently`);
    throw new Error(msg);
  }
}

export interface CreateChamadoInput {
  DESCRCHAMADO: string;
  STATUS?: string;
  PRIORIDADE?: string;
  TIPOCHAMADO?: string;
  SOLICITANTE: number;
  SOLICITADO?: number;
  CODPARC?: number;
  DHPREVENTREGA?: string;
  SETOR?: string;
  FINALIZADOPOR?: number;
  DHFINCHAM?: string;
  DHCHAMADO?: string;
  VALIDADOPOR?: number;
  DHVALIDACAO?: string;
  VALIDADO?: string;
}

export interface UpdateChamadoInput {
  DESCRCHAMADO?: string;
  STATUS?: string;
  PRIORIDADE?: string;
  TIPOCHAMADO?: string;
  SOLICITANTE?: number;
  SOLICITADO?: number;
  FINALIZADOPOR?: number;
  CODPARC?: number;
  DHPREVENTREGA?: string;
  SETOR?: string;
}

export interface AddOcorrenciaInput {
  NUCHAMADO: number;
  DESCROCORRENCIA: string;
  CODUSU?: number;
}

export class ChamadosMutationService {
  private me: MutationExecutor;

  constructor() {
    this.me = new MutationExecutor();
  }

  async createChamado(input: CreateChamadoInput, userToken?: string) {
    if (!input.DESCRCHAMADO?.trim()) {
      throw new ValidationError('DESCRCHAMADO is required');
    }

    const status = input.STATUS ?? 'P';

    const now = new Date().toISOString();
    const dados: Record<string, unknown> = {
      DESCRCHAMADO: input.DESCRCHAMADO.trim(),
      STATUS: status,
      PRIORIDADE: input.PRIORIDADE ?? 'M',
      TIPOCHAMADO: input.TIPOCHAMADO ?? '99',
      DHCHAMADO: input.DHCHAMADO ?? now,
      DHALTER: now,
    };

    dados.SOLICITANTE = input.SOLICITANTE;
    if (input.SOLICITADO) dados.SOLICITADO = input.SOLICITADO;
    if (input.CODPARC) dados.CODPARC = input.CODPARC;
    if (input.DHPREVENTREGA) dados.DHPREVENTREGA = input.DHPREVENTREGA;
    if (input.SETOR) dados.SETOR = input.SETOR;

    if (status === 'F') {
      dados.DHFINCHAM = input.DHFINCHAM ?? new Date().toISOString();
      dados.FINALIZADOPOR = input.FINALIZADOPOR ?? input.SOLICITANTE;
    } else if (status === 'C') {
      if (input.DHFINCHAM) dados.DHFINCHAM = input.DHFINCHAM;
      if (input.FINALIZADOPOR) dados.FINALIZADOPOR = input.FINALIZADOPOR;
    }

    if (input.VALIDADO) {
      dados.VALIDADO = input.VALIDADO;
      if (input.VALIDADO === 'S') {
        dados.DHVALIDACAO = input.DHVALIDACAO ?? new Date().toISOString();
        if (input.VALIDADOPOR) dados.VALIDADOPOR = input.VALIDADOPOR;
      }
    }

    const result = await this.me.insert('AD_COMADM', dados, { userToken });
    assertMutationSuccess(result, 'criar chamado');
    bustChamadosCache();
    return result;
  }

  async updateChamado(nuchamado: number, input: UpdateChamadoInput, userToken?: string) {
    if (!nuchamado || nuchamado <= 0) {
      throw new ValidationError('NUCHAMADO must be a positive number');
    }

    const dadosNovos: Record<string, unknown> = {
      DHALTER: new Date().toISOString(),
    };

    if (input.DESCRCHAMADO !== undefined) {
      dadosNovos.DESCRCHAMADO = input.DESCRCHAMADO.trim();
    }
    if (input.STATUS !== undefined) dadosNovos.STATUS = input.STATUS;
    if (input.PRIORIDADE !== undefined) dadosNovos.PRIORIDADE = input.PRIORIDADE;
    if (input.TIPOCHAMADO !== undefined) dadosNovos.TIPOCHAMADO = input.TIPOCHAMADO;
    if (input.SOLICITANTE !== undefined) dadosNovos.SOLICITANTE = input.SOLICITANTE;
    if (input.SOLICITADO !== undefined) dadosNovos.SOLICITADO = input.SOLICITADO;
    if (input.FINALIZADOPOR !== undefined) dadosNovos.FINALIZADOPOR = input.FINALIZADOPOR;
    if (input.CODPARC !== undefined) dadosNovos.CODPARC = input.CODPARC;
    if (input.DHPREVENTREGA !== undefined) dadosNovos.DHPREVENTREGA = input.DHPREVENTREGA;
    if (input.SETOR !== undefined) dadosNovos.SETOR = input.SETOR;

    const result = await this.me.update(
      'AD_COMADM', { NUCHAMADO: nuchamado }, dadosNovos, { userToken },
    );
    assertMutationSuccess(result, 'atualizar chamado');
    bustChamadosCache();
    return result;
  }

  async updateStatus(nuchamado: number, status: string, codUsu?: number, userToken?: string) {
    const validStatuses = ['P', 'E', 'S', 'A', 'C', 'F'];
    if (!validStatuses.includes(status)) {
      throw new ValidationError(`Invalid status: ${status}. Valid: ${validStatuses.join(', ')}`);
    }

    const statusLabels: Record<string, string> = {
      P: 'Pendente', E: 'Em Atendimento', S: 'Solic. Aprovacao',
      A: 'Aprovado', F: 'Finalizado', C: 'Cancelado',
    };

    const now = new Date().toISOString();
    const dadosNovos: Record<string, unknown> = {
      STATUS: status,
      DHALTER: now,
    };

    // Always record who changed the status
    if (codUsu) {
      dadosNovos.CODUSUALTER = codUsu;
    }

    // When moving to Em Atendimento, assign to the person taking it
    if (status === 'E' && codUsu) {
      dadosNovos.SOLICITADO = codUsu;
    }

    // When finalizing, record who and when
    if (status === 'F') {
      dadosNovos.DHFINCHAM = now;
      if (codUsu) {
        dadosNovos.FINALIZADOPOR = codUsu;
      }
    }

    const result = await this.me.update(
      'AD_COMADM', { NUCHAMADO: nuchamado }, dadosNovos, { userToken },
    );
    assertMutationSuccess(result, 'alterar status chamado');

    // Auto-add tratativa logging the status change
    if (codUsu) {
      const label = statusLabels[status] ?? status;
      await this.me.insert('AD_COMADM1', {
        NUCHAMADO: nuchamado,
        DESCROCORRENCIA: `Status alterado para: ${label}`,
        DHOCORRENCIA: now,
        ATENDENTE: codUsu,
      }, { userToken }).catch((err: unknown) => {
        logger.warn({ nuchamado, err }, '[ChamadosMutation] Auto-log insert failed');
      });
    }

    bustChamadosCache();
    return result;
  }

  async addOcorrencia(input: AddOcorrenciaInput, userToken?: string) {
    if (!input.NUCHAMADO || input.NUCHAMADO <= 0) {
      throw new ValidationError('NUCHAMADO must be a positive number');
    }
    if (!input.DESCROCORRENCIA?.trim()) {
      throw new ValidationError('DESCROCORRENCIA is required');
    }

    const dados: Record<string, unknown> = {
      NUCHAMADO: input.NUCHAMADO,
      DESCROCORRENCIA: input.DESCROCORRENCIA.trim(),
      DHOCORRENCIA: new Date().toISOString(),
    };

    if (input.CODUSU) dados.ATENDENTE = input.CODUSU;

    const result = await this.me.insert('AD_COMADM1', dados, { userToken });
    assertMutationSuccess(result, 'adicionar ocorrencia');
    return result;
  }

  async deleteOcorrencia(nuchamado: number, sequencia: number, userToken?: string) {
    if (!nuchamado || nuchamado <= 0) {
      throw new ValidationError('NUCHAMADO must be a positive number');
    }
    if (!sequencia || sequencia <= 0) {
      throw new ValidationError('SEQUENCIA must be a positive number');
    }

    const result = await this.me.delete(
      'AD_COMADM1',
      { NUCHAMADO: nuchamado, SEQUENCIA: sequencia },
      { userToken },
    );
    assertMutationSuccess(result, 'excluir ocorrencia');
    bustChamadosCache();
    return result;
  }
}
