import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { fetchQuemFaz } from '@/api/rdo';

export interface AtividadeAtiva {
  sigla: string;
  hrini: string;
}

export type AtividadesMap = Map<number, AtividadeAtiva>;

interface QuemFazItem {
  CODPARC?: number;
  codparc?: number;
  MOTIVOSIGLA?: string;
  motivoSigla?: string;
  sigla?: string;
  HRINI?: string;
  hrini?: string;
}

function buildMap(raw: unknown): AtividadesMap {
  const map = new Map<number, AtividadeAtiva>();
  if (!raw || !Array.isArray(raw)) return map;

  for (const item of raw as QuemFazItem[]) {
    const codparc = item.CODPARC ?? item.codparc;
    const sigla = item.MOTIVOSIGLA ?? item.motivoSigla ?? item.sigla ?? '';
    const hrini = item.HRINI ?? item.hrini ?? '';
    if (codparc && sigla) {
      map.set(codparc, { sigla, hrini });
    }
  }
  return map;
}

export function useAtividadesAtivas() {
  const hoje = format(new Date(), 'yyyy-MM-dd');

  const query = useQuery({
    queryKey: ['quem-faz', hoje],
    queryFn: () => fetchQuemFaz(hoje),
    staleTime: 30_000,
    refetchInterval: 30_000,
  });

  const mapa: AtividadesMap = query.data
    ? buildMap(query.data.data ?? query.data)
    : new Map();

  return { ...query, mapa };
}
