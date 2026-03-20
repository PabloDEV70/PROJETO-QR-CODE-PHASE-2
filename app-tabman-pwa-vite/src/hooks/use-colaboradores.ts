import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { fetchColaboradores } from '@/api/funcionarios';
import { useDeviceStore } from '@/stores/device-store';

export function useColaboradores() {
  const [sp] = useSearchParams();
  const depFilter = sp.get('departamento') || null;
  const hiddenCodparcs = useDeviceStore((s) => s.hiddenCodparcs);
  const showAfastados = useDeviceStore((s) => s.showAfastados);

  const query = useQuery({
    queryKey: ['colaboradores', showAfastados],
    queryFn: () => fetchColaboradores(showAfastados),
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: true,
  });

  // Deduplicate by codparc (keep first occurrence — API orders by nome)
  const deduped = useMemo(() => {
    if (!query.data) return [];
    const seen = new Set<number>();
    return query.data.filter((c) => {
      if (seen.has(c.codparc)) return false;
      seen.add(c.codparc);
      return true;
    });
  }, [query.data]);

  // Extract unique department names for Autocomplete
  const departamentos = useMemo(() => {
    const set = new Set<string>();
    for (const c of deduped) {
      if (c.departamento && !c.departamento.startsWith('<')) set.add(c.departamento);
    }
    return [...set].sort();
  }, [deduped]);

  // Apply device-level filters: hidden codparcs + afastados
  const deviceFiltered = useMemo(() => {
    let result = deduped;
    if (hiddenCodparcs.length > 0) {
      const hiddenSet = new Set(hiddenCodparcs);
      result = result.filter((c) => !hiddenSet.has(c.codparc));
    }
    if (!showAfastados) {
      result = result.filter((c) => c.situacao === null || c.situacao === '1');
    }
    return result;
  }, [deduped, hiddenCodparcs, showAfastados]);

  // Client-side filter by department name from URL
  const filtered = useMemo(() => {
    if (!depFilter) return deviceFiltered;
    return deviceFiltered.filter((c) => c.departamento === depFilter);
  }, [deviceFiltered, depFilter]);

  return {
    ...query,
    data: filtered,
    allColaboradores: deduped,
    departamentos,
    total: deduped.length,
  };
}
