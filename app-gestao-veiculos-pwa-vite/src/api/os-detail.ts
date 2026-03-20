import { apiClient } from '@/api/client';

export interface OsExecutor {
  NUOS: number;
  SEQUENCIA: number;
  codusu: number | null;
  codparc: number | null;
  nomeUsuario: string | null;
  nomeColaborador: string | null;
  dtIni: string | null;
  dtFin: string | null;
  minutos: number | null;
  obs: string | null;
}

export interface OsEnriched {
  NUOS: number;
  STATUS: string;
  statusLabel: string;
  DTABERTURA: string | null;
  DATAFIN: string | null;
  veiculoPlaca: string | null;
  veiculoMarca: string | null;
  veiculoTag: string | null;
  veiculoTipo: string | null;
  tipoLabel: string | null;
  manutencaoLabel: string | null;
  localLabel: string | null;
  totalServicos: number;
  custoTotal: number;
  nomeUsuInc: string | null;
  nomeUsuAlter: string | null;
  nomeUsuFin: string | null;
  servicos: any[];
  executores: OsExecutor[];
}

export async function fetchOsDetail(nuos: number): Promise<OsEnriched> {
  const { data } = await apiClient.get(`/os/${nuos}`);
  return data;
}
