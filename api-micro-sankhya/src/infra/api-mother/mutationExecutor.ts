import axios from 'axios';
import { apiMotherClient } from './client';
import { env } from '../../config/env';
import { logger } from '../../shared/logger';
import { getDatabase } from './database-context';


interface MutationResult {
  foiSucesso: boolean;
  sucesso: boolean;
  tipo: string;
  nomeTabela: string;
  registrosAfetados: number;
  mensagem: string;
  dadosInseridos?: Record<string, unknown>;
  dadosAntigos?: Record<string, unknown>[];
  tempoExecucao?: string;
  dryRun?: boolean;
}

interface MutationOptions {
  dryRun?: boolean;
  limiteRegistros?: number;
  userToken?: string;
}

export class MutationExecutor {
  private makeUserRequest(method: 'post' | 'put' | 'delete', url: string, data: unknown, userToken: string) {
    const db = getDatabase();
    return axios({
      method,
      url: `${env.API_MAE_BASE_URL}${url}`,
      data,
      headers: {
        Authorization: `Bearer ${userToken}`,
        'Content-Type': 'application/json',
        'X-Database': db,
      },
      timeout: 30000,
    });
  }

  async insert(
    nomeTabela: string,
    dados: Record<string, unknown>,
    options?: MutationOptions,
  ): Promise<MutationResult> {
    const db = getDatabase();
    const body = {
      nomeTabela,
      dados,
      dryRun: options?.dryRun ?? false,
    };

    logger.info(
      { db, table: nomeTabela, dados, dryRun: body.dryRun, asUser: !!options?.userToken },
      '[MutationExecutor] Insert request',
    );

    try {
      const response = options?.userToken
        ? await this.makeUserRequest('post', '/v2/mutation/insert', body, options.userToken)
        : await apiMotherClient.post('/v2/mutation/insert', body);

      const result = response.data?.data ?? response.data;
      logger.info(
        {
          db,
          table: nomeTabela,
          affected: result?.registrosAfetados,
          sucesso: result?.sucesso,
          mensagem: result?.mensagem,
        },
        '[MutationExecutor] Insert result',
      );
      return result;
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      const axiosErr = error as { response?: { data?: unknown; status?: number } };
      logger.error(
        {
          err: msg,
          db,
          table: nomeTabela,
          dados,
          httpStatus: axiosErr?.response?.status,
          responseData: axiosErr?.response?.data,
        },
        '[MutationExecutor] Insert FAILED',
      );
      throw error;
    }
  }

  async update(
    nomeTabela: string,
    condicao: Record<string, unknown>,
    dadosNovos: Record<string, unknown>,
    options?: MutationOptions,
  ): Promise<MutationResult> {
    const db = getDatabase();
    const payload = {
      nomeTabela,
      condicao,
      dadosNovos,
      limiteRegistros: options?.limiteRegistros ?? 1,
      dryRun: options?.dryRun ?? false,
    };

    logger.info(
      {
        db, table: nomeTabela, condicao, dadosNovos,
        limiteRegistros: payload.limiteRegistros, asUser: !!options?.userToken,
      },
      '[MutationExecutor] Update request',
    );

    try {
      const response = options?.userToken
        ? await this.makeUserRequest('put', '/v2/mutation/update', payload, options.userToken)
        : await apiMotherClient.put('/v2/mutation/update', payload);

      const result = response.data?.data ?? response.data;
      logger.info(
        {
          db,
          table: nomeTabela,
          condition: condicao,
          affected: result?.registrosAfetados,
          sucesso: result?.sucesso,
          mensagem: result?.mensagem,
        },
        '[MutationExecutor] Update result',
      );
      return result;
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      const axiosErr = error as { response?: { data?: unknown; status?: number } };
      logger.error(
        {
          err: msg,
          db,
          table: nomeTabela,
          condicao,
          dadosNovos,
          httpStatus: axiosErr?.response?.status,
          responseData: axiosErr?.response?.data,
        },
        '[MutationExecutor] Update FAILED',
      );
      throw error;
    }
  }

  async delete(
    nomeTabela: string,
    condicao: Record<string, unknown>,
    options?: MutationOptions,
  ): Promise<MutationResult> {
    const db = getDatabase();
    const payload = {
      nomeTabela,
      condicao,
      limiteRegistros: options?.limiteRegistros ?? 1,
      dryRun: options?.dryRun ?? false,
    };

    logger.info(
      { db, table: nomeTabela, condicao, asUser: !!options?.userToken },
      '[MutationExecutor] Delete request',
    );

    try {
      const response = options?.userToken
        ? await this.makeUserRequest('delete', '/v2/mutation/delete', payload, options.userToken)
        : await apiMotherClient.delete('/v2/mutation/delete', { data: payload });

      const result = response.data?.data ?? response.data;
      logger.info(
        {
          db,
          table: nomeTabela,
          condition: condicao,
          affected: result?.registrosAfetados,
          sucesso: result?.sucesso,
        },
        '[MutationExecutor] Delete result',
      );
      return result;
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      const axiosErr = error as { response?: { data?: unknown; status?: number } };
      logger.error(
        {
          err: msg, db, table: nomeTabela, condicao,
          httpStatus: axiosErr?.response?.status,
          responseData: axiosErr?.response?.data,
        },
        '[MutationExecutor] Delete FAILED',
      );
      throw error;
    }
  }
}
