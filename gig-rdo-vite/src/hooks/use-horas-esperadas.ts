import { useQuery } from '@tanstack/react-query';
import { getHorasEsperadas } from '@/api/horas-esperadas';

export function useHorasEsperadas(params: {
  dataInicio?: string;
  dataFim?: string;
  coddep?: string;
  codparc?: string;
}) {
  return useQuery({
    queryKey: ['horas-esperadas', params],
    queryFn: () => getHorasEsperadas({
      dataInicio: params.dataInicio!,
      dataFim: params.dataFim!,
      ...(params.coddep ? { coddep: params.coddep } : {}),
      ...(params.codparc ? { codparc: params.codparc } : {}),
    }),
    enabled: !!params.dataInicio && !!params.dataFim,
    staleTime: 5 * 60 * 1000,
  });
}
