import { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getMesRhDates } from '@/utils/date-helpers';
import { saveOsFilters, loadOsFilters } from '@/utils/os-filter-storage';
import type { OsListParams } from '@/types/os-types';

export type OsTab = 'lista' | 'kanban';

export function useOsUrlParams() {
  const [searchParams, setSearchParams] = useSearchParams();

  const defaults = useMemo(() => {
    const saved = loadOsFilters();
    const mesRh = getMesRhDates();
    return {
      dataInicio: saved?.dataInicio ?? mesRh.ini,
      dataFim: saved?.dataFim ?? mesRh.fim,
      status: saved?.status ?? '',
      manutencao: saved?.manutencao ?? '',
      statusGig: saved?.statusGig ?? '',
      tab: saved?.tab ?? 'lista',
      showKpis: saved?.showKpis ?? '1',
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
  const rawSearch = get('search', '');
  const tab = (get('tab', defaults.tab) as OsTab) || 'lista';
  const page = Number(get('page', '1'));
  const limit = Number(get('limit', '50'));
  const showKpis = get('showKpis', defaults.showKpis) === '1';

  // Debounced search: URL updates immediately, but API call uses debounced value
  const [debouncedSearch, setDebouncedSearch] = useState(rawSearch);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(rawSearch);
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [rawSearch]);

  const setParam = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(searchParams);
      if (value) next.set(key, value);
      else next.delete(key);
      if (key !== 'page' && key !== 'tab' && key !== 'showKpis') next.set('page', '1');
      saveOsFilters(next);
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const clearFilters = useCallback(() => {
    const next = new URLSearchParams();
    next.set('tab', tab);
    if (showKpis) next.set('showKpis', '1');
    const mesRh = getMesRhDates();
    next.set('dataInicio', mesRh.ini);
    next.set('dataFim', mesRh.fim);
    saveOsFilters(next);
    setSearchParams(next, { replace: true });
  }, [tab, showKpis, setSearchParams]);

  const listParams: OsListParams = useMemo(
    () => ({
      page, limit,
      ...(dataInicio && { dataInicio }),
      ...(dataFim && { dataFim }),
      ...(status && { status }),
      ...(manutencao && { manutencao }),
      ...(statusGig && { statusGig }),
      ...(debouncedSearch && { search: debouncedSearch }),
    }),
    [page, limit, dataInicio, dataFim, status, manutencao, statusGig, debouncedSearch],
  );

  return {
    dataInicio, dataFim, status, manutencao, statusGig,
    search: rawSearch,
    tab, page, limit, showKpis,
    setParam, clearFilters, listParams,
  };
}
