import { useQuery } from '@tanstack/react-query';
import { getPerfilEnriquecido } from '@/api/funcionarios';

export function usePerfilEnriquecido(codparc: number | undefined) {
  return useQuery({
    queryKey: ['perfil-enriquecido', codparc],
    queryFn: () => getPerfilEnriquecido(codparc!),
    enabled: !!codparc,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}
