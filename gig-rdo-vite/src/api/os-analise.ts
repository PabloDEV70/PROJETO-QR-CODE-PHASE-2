import { apiClient } from '@/api/client';
import type {
  OsAnaliseTipoVeiculo,
  OsTendenciaTipoVeiculo,
  OsAnaliseParams,
} from '@/types/os-analise-types';

export async function getAnaliseTipoVeiculo(
  params: OsAnaliseParams = {},
): Promise<OsAnaliseTipoVeiculo[]> {
  const { data } = await apiClient.get<OsAnaliseTipoVeiculo[]>(
    '/os/analise-tipo-veiculo',
    { params },
  );
  return data;
}

export async function getTendenciaTipoVeiculo(
  tipoVeiculo: string,
): Promise<OsTendenciaTipoVeiculo[]> {
  const { data } = await apiClient.get<OsTendenciaTipoVeiculo[]>(
    '/os/analise-tipo-veiculo/tendencia',
    { params: { tipoVeiculo } },
  );
  return data;
}
