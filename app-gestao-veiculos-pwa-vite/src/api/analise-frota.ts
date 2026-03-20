import { apiClient } from '@/api/client';

export interface FrotaRow {
  codveiculo: number;
  placa: string;
  marcamodelo: string;
  tag: string | null;
  tipoEqpto: string | null;
  tipoGrupo: string | null;
  categoria: string | null;
  anoFabric: number | null;
  idadeAnos: number;
  totalOS: number;
  osFechadas: number;
  osAbertas: number;
  diasEmManutencao: number;
  custoTotal: number;
  custo6m: number;
  custo6mAnterior: number;
  primeiraOS: string | null;
  ultimaOS: string | null;
  diasDesdeUltimaOS: number;
  scoreRisco: number;
  tendencia: 'subindo' | 'estavel' | 'descendo';
  risco: 'alto' | 'medio' | 'baixo';
}

export async function fetchAnalisefrota(): Promise<FrotaRow[]> {
  const { data } = await apiClient.get('/veiculos/analise-frota');
  return Array.isArray(data) ? data : data?.data ?? [];
}

export async function fetchAnaliseVeiculo(codveiculo: number) {
  const { data } = await apiClient.get(`/veiculos/analise-frota/${codveiculo}`);
  return data;
}
