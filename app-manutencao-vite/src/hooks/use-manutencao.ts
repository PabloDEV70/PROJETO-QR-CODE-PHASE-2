import { useQuery } from '@tanstack/react-query';
import {
  getOsKpis, getManDashboard, getAlertas, getOsAtivasDetalhadas,
  getVeiculosMultiplasOs, getMediaDiasPorTipo, getPlanos,
  getPlanosAderencia, getPlanosAtrasadas, getPlanosResumo,
  getTecnicosProdutividade, getVeiculoDashboard,
  getVeiculoProximaManutencao, getVeiculoAderencia,
  getVeiculoHistorico, getVeiculoCustos, getFrotaStatus,
  getFrotaManutencoesUrgentes, getVeiculoServicosFrequentes,
  getTempoServicos,
  getPerformanceServicoExecutor, getPerformanceServicoExecucoes,
  getServicosComExecucao,
  getGruposArvore,
  getServicosPorGrupo,
} from '@/api/manutencao';

// --- KPIs & Dashboard ---

export function useOsKpis(params?: { dataInicio?: string; dataFim?: string }) {
  return useQuery({
    queryKey: ['man', 'kpis', params],
    queryFn: () => getOsKpis(params),
    staleTime: 60_000,
  });
}

export function useManDashboard() {
  return useQuery({
    queryKey: ['man', 'dashboard'],
    queryFn: () => getManDashboard(),
    staleTime: 60_000,
  });
}

// --- Alertas ---

export function useAlertas() {
  return useQuery({
    queryKey: ['man', 'alertas'],
    queryFn: () => getAlertas(),
    staleTime: 30_000,
  });
}

export function useOsAtivasDetalhadas(limit?: number) {
  return useQuery({
    queryKey: ['man', 'ativas', limit],
    queryFn: () => getOsAtivasDetalhadas(limit),
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
}

export function useVeiculosMultiplasOs() {
  return useQuery({
    queryKey: ['man', 'veiculos-multiplas-os'],
    queryFn: () => getVeiculosMultiplasOs(),
    staleTime: 60_000,
  });
}

export function useMediaDiasPorTipo() {
  return useQuery({
    queryKey: ['man', 'media-dias'],
    queryFn: () => getMediaDiasPorTipo(),
    staleTime: 60_000,
  });
}

// --- Planos Preventivos ---

export function usePlanos() {
  return useQuery({
    queryKey: ['man', 'planos'],
    queryFn: () => getPlanos(),
    staleTime: 60_000,
  });
}

export function usePlanosAderencia(params?: { situacao?: string; codveiculo?: number }) {
  return useQuery({
    queryKey: ['man', 'planos', 'aderencia', params],
    queryFn: () => getPlanosAderencia(params),
    staleTime: 60_000,
  });
}

export function usePlanosAtrasadas() {
  return useQuery({
    queryKey: ['man', 'planos', 'atrasadas'],
    queryFn: () => getPlanosAtrasadas(),
    staleTime: 60_000,
  });
}

export function usePlanosResumo() {
  return useQuery({
    queryKey: ['man', 'planos', 'resumo'],
    queryFn: () => getPlanosResumo(),
    staleTime: 60_000,
  });
}

// --- Ranking / Produtividade ---

export function useTecnicosProdutividade(params?: { dataInicio?: string; dataFim?: string }) {
  return useQuery({
    queryKey: ['man', 'tecnicos', 'produtividade', params],
    queryFn: () => getTecnicosProdutividade(params),
    staleTime: 60_000,
  });
}

// --- Veiculo Detail ---

export function useVeiculoDashboard(codveiculo: number | null) {
  return useQuery({
    queryKey: ['man', 'veiculo', codveiculo, 'dashboard'],
    queryFn: () => getVeiculoDashboard(codveiculo!),
    enabled: !!codveiculo,
    staleTime: 30_000,
  });
}

export function useVeiculoProximaManutencao(codveiculo: number | null) {
  return useQuery({
    queryKey: ['man', 'veiculo', codveiculo, 'proxima-manutencao'],
    queryFn: () => getVeiculoProximaManutencao(codveiculo!),
    enabled: !!codveiculo,
    staleTime: 60_000,
  });
}

export function useVeiculoAderencia(codveiculo: number | null) {
  return useQuery({
    queryKey: ['man', 'veiculo', codveiculo, 'aderencia'],
    queryFn: () => getVeiculoAderencia(codveiculo!),
    enabled: !!codveiculo,
    staleTime: 60_000,
  });
}

export function useVeiculoHistorico(
  codveiculo: number | null,
  params?: { status?: string; tipo?: string; dataInicio?: string; dataFim?: string },
) {
  return useQuery({
    queryKey: ['man', 'veiculo', codveiculo, 'historico', params],
    queryFn: () => getVeiculoHistorico(codveiculo!, params),
    enabled: !!codveiculo,
    staleTime: 30_000,
  });
}

export function useVeiculoCustos(
  codveiculo: number | null,
  params?: { dataInicio?: string; dataFim?: string },
) {
  return useQuery({
    queryKey: ['man', 'veiculo', codveiculo, 'custos', params],
    queryFn: () => getVeiculoCustos(codveiculo!, params),
    enabled: !!codveiculo,
    staleTime: 60_000,
  });
}

export function useVeiculoServicosFrequentes(codveiculo: number | null) {
  return useQuery({
    queryKey: ['man', 'veiculo', codveiculo, 'servicos-frequentes'],
    queryFn: () => getVeiculoServicosFrequentes(codveiculo!),
    enabled: !!codveiculo,
    staleTime: 60_000,
  });
}

// --- Tempo Servicos ---

export function useTempoServicos(params?: {
  dataInicio?: string;
  dataFim?: string;
  codexec?: number;
  codGrupoProd?: number;
}) {
  return useQuery({
    queryKey: ['man', 'tempo-servicos', params],
    queryFn: () => getTempoServicos(params),
    staleTime: 60_000,
  });
}

// --- Servicos com Execucao ---

export function useServicosComExecucao() {
  return useQuery({
    queryKey: ['man', 'servicos-com-execucao'],
    queryFn: () => getServicosComExecucao(),
    staleTime: 5 * 60_000,
  });
}

// --- Grupos Arvore ---

export function useGruposArvore() {
  return useQuery({
    queryKey: ['man', 'grupos-arvore'],
    queryFn: () => getGruposArvore(),
    staleTime: 5 * 60_000,
  });
}

export function useServicosPorGrupo(codGrupo: number | null) {
  return useQuery({
    queryKey: ['man', 'servicos-por-grupo', codGrupo],
    queryFn: () => getServicosPorGrupo(codGrupo!),
    enabled: !!codGrupo,
    staleTime: 5 * 60_000,
  });
}

// --- Performance Servico x Executor ---

export function usePerformanceServicoExecutor(params: {
  codprod: number | null;
  dataInicio?: string;
  dataFim?: string;
}) {
  return useQuery({
    queryKey: ['man', 'perf-servico-executor', params],
    queryFn: () => getPerformanceServicoExecutor({
      codprod: params.codprod!,
      ...(params.dataInicio ? { dataInicio: params.dataInicio } : {}),
      ...(params.dataFim ? { dataFim: params.dataFim } : {}),
    }),
    enabled: !!params.codprod,
    staleTime: 60_000,
  });
}

export function usePerformanceServicoExecucoes(params: {
  codprod: number | null;
  dataInicio?: string;
  dataFim?: string;
}) {
  return useQuery({
    queryKey: ['man', 'perf-servico-execucoes', params],
    queryFn: () => getPerformanceServicoExecucoes({
      codprod: params.codprod!,
      ...(params.dataInicio ? { dataInicio: params.dataInicio } : {}),
      ...(params.dataFim ? { dataFim: params.dataFim } : {}),
    }),
    enabled: !!params.codprod,
    staleTime: 60_000,
  });
}

// --- Frota ---

export function useFrotaStatus() {
  return useQuery({
    queryKey: ['man', 'frota', 'status'],
    queryFn: () => getFrotaStatus(),
    staleTime: 30_000,
  });
}

export function useFrotaManutencoesUrgentes() {
  return useQuery({
    queryKey: ['man', 'frota', 'urgentes'],
    queryFn: () => getFrotaManutencoesUrgentes(),
    staleTime: 30_000,
  });
}
