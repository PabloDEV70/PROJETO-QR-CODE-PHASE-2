import { apiClient, getApiBaseUrl } from '@/api/client';
import { useAuthStore } from '@/stores/auth-store';
import type {
  FuncionarioPerfilEnriquecido,
  FuncionarioPerfilSuper,
  FuncionarioBusca,
  FuncionarioListaResponse,
  FuncionariosResumo,
  FiltrosOpcoes,
  HoraExtraResponse,
  ListarFuncionariosParams,
  FuncionarioCardPublico,
} from '@/types/funcionario-types';

export async function getFuncionarioPerfil(
  codparc: number,
): Promise<FuncionarioPerfilEnriquecido | null> {
  try {
    const { data } = await apiClient.get<FuncionarioPerfilEnriquecido>(
      `/funcionarios/${codparc}/perfil-enriquecido`,
    );
    return data;
  } catch (error) {
    if ((error as { response?: { status: number } }).response?.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function getFuncionarioPerfilSuper(
  codparc: number,
): Promise<FuncionarioPerfilSuper | null> {
  try {
    const { data } = await apiClient.get<FuncionarioPerfilSuper>(
      `/funcionarios/${codparc}/perfil-super`,
    );
    return data;
  } catch (error) {
    if ((error as { response?: { status: number } }).response?.status === 404) {
      return null;
    }
    throw error;
  }
}

export function getFuncionarioFotoUrl(codparc: number): string {
  const baseUrl = getApiBaseUrl();
  const token = useAuthStore.getState().user?.token ?? '';
  return `${baseUrl}/funcionarios/${codparc}/foto?token=${token}`;
}

export function getFuncionarioFotoByCodfuncUrl(
  codemp: number,
  codfunc: number,
): string {
  const baseUrl = getApiBaseUrl();
  const token = useAuthStore.getState().user?.token ?? '';
  return `${baseUrl}/funcionarios/foto/${codemp}/${codfunc}?token=${token}`;
}

export async function buscarFuncionarios(
  termo: string,
): Promise<FuncionarioBusca[]> {
  const { data } = await apiClient.get<FuncionarioBusca[]>(
    '/funcionarios/buscar',
    { params: { q: termo } },
  );
  return data;
}

export async function listarFuncionarios(
  params: ListarFuncionariosParams | Record<string, string | number>,
): Promise<FuncionarioListaResponse> {
  const { data } = await apiClient.get<FuncionarioListaResponse>(
    '/funcionarios/listar',
    { params },
  );
  return data;
}

export async function getFuncionariosResumo(): Promise<FuncionariosResumo> {
  const { data } = await apiClient.get<FuncionariosResumo>('/funcionarios/resumo');
  return data;
}

export async function getFiltrosOpcoes(): Promise<FiltrosOpcoes> {
  const { data } = await apiClient.get<FiltrosOpcoes>('/funcionarios/filtros-opcoes');
  return data;
}

export async function getFuncionarioHoraExtra(
  codparc: number,
  params?: { dataInicio?: string; dataFim?: string },
): Promise<HoraExtraResponse> {
  const { data } = await apiClient.get<HoraExtraResponse>(
    `/funcionarios/${codparc}/hora-extra`,
    { params },
  );
  return data;
}

export async function getFuncionarioCardPublico(
  codemp: number,
  codfunc: number,
): Promise<FuncionarioCardPublico | null> {
  try {
    const { data } = await apiClient.get<{ data: FuncionarioCardPublico }>(
      `/funcionarios/card/${codemp}/${codfunc}`,
    );
    return data.data;
  } catch (error) {
    if ((error as { response?: { status: number } }).response?.status === 404) {
      return null;
    }
    throw error;
  }
}
