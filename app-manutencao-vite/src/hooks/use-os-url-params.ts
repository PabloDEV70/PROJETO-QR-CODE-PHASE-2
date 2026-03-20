import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getMesRhDates } from '@/utils/date-helpers';
import { saveOsFilters, loadOsFilters } from '@/utils/os-filter-storage';
import type { OsListParams } from '@/types/os-types';

export type OsTab = 'lista' | 'kanban';

export function useOsUrlParams() {
  const [searchParams, setSearchParams] = useSearchParams();

  const defaults = useMemo(() => {
    const saved = loadOsFilters();
    const rh = getMesRhDates();
    return {
      dataInicio: saved?.dataInicio ?? rh.ini,
      dataFim: saved?.dataFim ?? rh.fim,
      status: saved?.status ?? '',
      manutencao: saved?.manutencao ?? '',
      statusGig: saved?.statusGig ?? '',
      tab: saved?.tab ?? 'lista',
    };
  }, []);

  const get = useCallback(
    (key: string, fallback: string) => searchParams.get(key) ?? fallback,
    [searchParams],
  );

  const dataInicio = get('dataInicio', defaults.dataInicio);
  const dataFim = get('dataFim', defaults.dataFim);
  const status = get('status', defaults.status);
  const manutencao = get('manutencao', defaults.manutencao);
  const statusGig = get('statusGig', defaults.statusGig);
  const search = get('search', '');
  const tab = (get('tab', defaults.tab) as OsTab) || 'lista';
  const page = Number(get('page', '1'));
  const limit = Number(get('limit', '50'));

  const setParam = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(searchParams);
      if (value) next.set(key, value);
      else next.delete(key);
      if (key !== 'page' && key !== 'tab') next.set('page', '1');
      saveOsFilters(next);
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const clearFilters = useCallback(() => {
    const rh = getMesRhDates();
    const next = new URLSearchParams();
    next.set('dataInicio', rh.ini);
    next.set('dataFim', rh.fim);
    next.set('tab', tab);
    saveOsFilters(next);
    setSearchParams(next, { replace: true });
  }, [tab, setSearchParams]);

  const listParams: OsListParams = useMemo(
    () => ({
      page, limit, dataInicio, dataFim,
      ...(status && { status }),
      ...(manutencao && { manutencao }),
      ...(statusGig && { statusGig }),
      ...(search && { search }),
    }),
    [page, limit, dataInicio, dataFim, status, manutencao, statusGig, search],
  );

  return {
    dataInicio, dataFim, status, manutencao, statusGig, search,
    tab, page, limit,
    setParam, clearFilters, listParams,
  };
}
