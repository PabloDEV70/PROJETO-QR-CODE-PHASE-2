import { apiClient } from '@/api/client';
import type {
  ListarTreinamentosParams,
  ColaboradorListResponse,
  TreinamentoListResponse,
  FiltrosOpcoes,
  ColaboradorListItem,
} from '@/types/treinamento-types';

const defaultColaboradorResponse: ColaboradorListResponse = {
  data: [],
  total: 0,
  limit: 25,
  page: 1,
  offset: 0,
};

const defaultTreinamentoResponse: TreinamentoListResponse = {
  codfunc: 0,
  data: [],
  total: 0
};

// Lista colaboradores (sem treinamentos)
export const listarColaboradores = async (
  params?: ListarTreinamentosParams
): Promise<ColaboradorListResponse> => {
  try {
    // Compatibilidade: algumas versões da API usam page/limit, outras usam offset/limit
    const safePage = params?.page ?? 1;
    const safeLimit = params?.limit ?? 25;
    const safeOffset = params?.offset ?? ((safePage - 1) * safeLimit);
    const requestParams = {
      page: safePage,
      limit: safeLimit,
      offset: safeOffset,
      coddep: params?.coddep,
    };
    const response = await apiClient.get<ColaboradorListResponse>('/treinamentos', { params: requestParams });

    if (response?.data && typeof response.data === 'object' && 'data' in response.data) {
      const normalizedPage = Number((response.data as ColaboradorListResponse).page) || requestParams.page;
      const normalizedLimit = Number((response.data as ColaboradorListResponse).limit) || requestParams.limit;
      return {
        ...response.data,
        page: normalizedPage,
        limit: normalizedLimit,
      };
    }

    return defaultColaboradorResponse;
  } catch (error) {
    console.error('Erro ao listar colaboradores:', error);
    return defaultColaboradorResponse;
  }
};

// Lista treinamentos de um colaborador específico
export const listarTreinamentosDoColaborador = async (
  codfunc: number
): Promise<TreinamentoListResponse> => {
  try {
    const response = await apiClient.get<TreinamentoListResponse>(
      `/treinamentos/${codfunc}/habilitacoes`
    );

    // Validar estrutura
    if (response?.data && typeof response.data === 'object') {
      const { data } = response.data;

      // Se data é um array, retornar como está
      if (Array.isArray(data)) {
        return response.data;
      }

      // Se data não é um array, retornar com array vazio
      if ('data' in response.data) {
        return {
          ...response.data,
          data: [],
        };
      }
    }

    return defaultTreinamentoResponse;
  } catch {
    // A rota de habilitações ainda não existe no backend atual.
    // Mantemos fallback silencioso para não quebrar a UI pública.
    console.warn('Endpoint de habilitações indisponível no backend, retornando lista vazia.');
    return defaultTreinamentoResponse;
  }
};

export const getFiltroOpcoes = async (): Promise<FiltrosOpcoes | null> => {
  try {
    const response = await apiClient.get<FiltrosOpcoes>('/funcionarios/filtros-opcoes');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar opções de filtro:', error);
    return null;
  }
};

export const getTreinamentosTodos = async (
  params?: ListarTreinamentosParams
): Promise<ColaboradorListItem[]> => {
  try {
    const response = await apiClient.get<ColaboradorListItem[]>(
      '/treinamentos/todos',
      { params: { coddep: params?.coddep } }
    );
    return response.data || [];
  } catch (error) {
    console.error('Erro ao listar todos os colaboradores para impressão:', error);
    return [];
  }
};

