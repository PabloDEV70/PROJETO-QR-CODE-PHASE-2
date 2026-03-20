import { useQuery } from '@tanstack/react-query';
import { fetchById } from '@/api/hstvei';

export function useHstVeiDetail(id: number) {
  return useQuery({
    queryKey: ['hstvei', 'detail', id],
    queryFn: () => fetchById(id),
    enabled: id > 0,
  });
}
