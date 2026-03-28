import { useQuery } from '@tanstack/react-query';
import {
  getStatsTempoTransito,
  getStatsPorMotorista,
  getStatsPorSolicitante,
  getStatsPorParceiro,
  getStatsVolumeMensal,
  getStatsPorTipo,
  getStatsPorHora,
} from '@/api/corridas';

interface DateRange {
  dataInicio?: string;
  dataFim?: string;
}

export function useStatsTempoTransito(params?: DateRange) {
  return useQuery({
    queryKey: ['corridas', 'stats', 'tempo-transito', params],
    queryFn: () => getStatsTempoTransito(params),
    staleTime: 60_000,
  });
}

export function useStatsPorMotorista(params?: DateRange) {
  return useQuery({
    queryKey: ['corridas', 'stats', 'por-motorista', params],
    queryFn: () => getStatsPorMotorista(params),
    staleTime: 60_000,
  });
}

export function useStatsPorSolicitante(params?: DateRange) {
  return useQuery({
    queryKey: ['corridas', 'stats', 'por-solicitante', params],
    queryFn: () => getStatsPorSolicitante(params),
    staleTime: 60_000,
  });
}

export function useStatsPorParceiro(params?: DateRange) {
  return useQuery({
    queryKey: ['corridas', 'stats', 'por-parceiro', params],
    queryFn: () => getStatsPorParceiro(params),
    staleTime: 60_000,
  });
}

export function useStatsVolumeMensal() {
  return useQuery({
    queryKey: ['corridas', 'stats', 'volume-mensal'],
    queryFn: getStatsVolumeMensal,
    staleTime: 5 * 60_000,
  });
}

export function useStatsPorTipo(params?: DateRange) {
  return useQuery({
    queryKey: ['corridas', 'stats', 'por-tipo', params],
    queryFn: () => getStatsPorTipo(params),
    staleTime: 60_000,
  });
}

export function useStatsPorHora(params?: DateRange) {
  return useQuery({
    queryKey: ['corridas', 'stats', 'por-hora', params],
    queryFn: () => getStatsPorHora(params),
    staleTime: 60_000,
  });
}
