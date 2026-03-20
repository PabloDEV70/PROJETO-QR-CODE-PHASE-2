import { useQuery } from '@tanstack/react-query';
import { fetchAtivasPorVeiculo, fetchHistorico } from '@/api/hstvei';

export function useAtivasPorVeiculo(codveiculo: number) {
  return useQuery({
    queryKey: ['hstvei', 'veiculo', codveiculo, 'ativas'],
    queryFn: () => fetchAtivasPorVeiculo(codveiculo),
    enabled: codveiculo > 0,
  });
}

export function useHistorico(codveiculo: number, page: number, limit = 50) {
  return useQuery({
    queryKey: ['hstvei', 'veiculo', codveiculo, 'historico', page],
    queryFn: () => fetchHistorico(codveiculo, page, limit),
    enabled: codveiculo > 0,
  });
}
