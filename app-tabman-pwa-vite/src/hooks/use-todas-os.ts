import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/client';

export interface OsGeral {
  NUOS: number;
  STATUS: string;
  statusLabel: string;
  TIPO: string;
  tipoLabel: string;
  MANUTENCAO: string;
  manutencaoLabel: string;
  CODVEICULO: number | null;
  PLACA: string | null;
  MARCAMODELO: string | null;
  AD_TAG: string | null;
  TOTAL_SERVICOS: number;
  CODEMP: number;
}

async function fetchTodasOs(): Promise<OsGeral[]> {
  // Buscar execucao + abertas em paralelo
  const [execRes, abertaRes] = await Promise.allSettled([
    apiClient.get('/os/list', { params: { status: 'E', limit: 100 } }),
    apiClient.get('/os/list', { params: { status: 'A', limit: 100 } }),
  ]);
  const exec = execRes.status === 'fulfilled' ? (execRes.value.data?.data ?? []) : [];
  const aberta = abertaRes.status === 'fulfilled' ? (abertaRes.value.data?.data ?? []) : [];
  return [...exec, ...aberta];
}

export function useTodasOs() {
  return useQuery({
    queryKey: ['todas-os'],
    queryFn: fetchTodasOs,
    staleTime: 2 * 60_000,
    retry: false,
  });
}
