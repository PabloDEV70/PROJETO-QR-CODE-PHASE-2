import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Density } from '../utils/rdo-filter-helpers';
import { getMesRhDates } from '../utils/rdo-filter-helpers';
import {
  saveFiltersToStorage,
  loadFiltersFromStorage,
  clearFiltersFromStorage,
} from '../utils/rdo-filter-storage';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 25;

export function useRdoUrlParams() {
  const [searchParams, setSearchParams] = useSearchParams();
  const didRestore = useRef(false);

  const mesRh = useMemo(() => getMesRhDates(), []);

  // On first render: ensure dates are ALWAYS in the URL
  useEffect(() => {
    if (didRestore.current) return;
    didRestore.current = true;

    const hasDateParams = searchParams.has('dataInicio') && searchParams.has('dataFim');
    if (hasDateParams) return;

    // Try localStorage first, fallback to Mes RH defaults
    const saved = loadFiltersFromStorage();
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (saved && Object.keys(saved).length > 0) {
        for (const [key, val] of Object.entries(saved)) {
          if (!next.has(key)) next.set(key, val);
        }
      }
      // Always guarantee dates in URL
      if (!next.has('dataInicio')) next.set('dataInicio', mesRh.ini);
      if (!next.has('dataFim')) next.set('dataFim', mesRh.fim);
      return next;
    }, { replace: true });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Persist to localStorage whenever searchParams change
  useEffect(() => {
    saveFiltersToStorage(searchParams);
  }, [searchParams]);

  const dataInicio = searchParams.get('dataInicio') || mesRh.ini;
  const dataFim = searchParams.get('dataFim') || mesRh.fim;
  const codparc = searchParams.get('codparc');
  const rdomotivocod = searchParams.get('rdomotivocod');
  const page = Number(searchParams.get('page')) || DEFAULT_PAGE;
  const limit = Number(searchParams.get('limit')) || DEFAULT_LIMIT;
  const tab = Number(searchParams.get('tab')) || 0;
  const density = (searchParams.get('density') as Density) || 'comfortable';
  const coddep = searchParams.get('coddep');
  const codfuncao = searchParams.get('codfuncao');
  const orderBy = searchParams.get('orderBy');
  const orderDir = searchParams.get('orderDir') as 'ASC' | 'DESC' | null;

  const filterParams = useMemo<Record<string, string | number>>(() => {
    const p: Record<string, string | number> = { dataInicio, dataFim };
    if (codparc) p.codparc = codparc;
    if (rdomotivocod) p.rdomotivocod = rdomotivocod;
    if (coddep) p.coddep = coddep;
    if (codfuncao) p.codfuncao = codfuncao;
    return p;
  }, [dataInicio, dataFim, codparc, rdomotivocod, coddep, codfuncao]);

  const listParams = useMemo<Record<string, string | number>>(() => {
    const p: Record<string, string | number> = {
      page, limit, dataInicio, dataFim,
    };
    if (codparc) p.codparc = codparc;
    if (coddep) p.coddep = coddep;
    if (codfuncao) p.codfuncao = codfuncao;
    if (orderBy) p.orderBy = orderBy;
    if (orderDir) p.orderDir = orderDir;
    return p;
  }, [page, limit, dataInicio, dataFim, codparc, coddep, codfuncao, orderBy, orderDir]);

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        for (const [key, val] of Object.entries(updates)) {
          if (val === null) next.delete(key);
          else next.set(key, val);
        }
        if (!('page' in updates)) next.delete('page');
        return next;
      });
    },
    [setSearchParams],
  );

  const clearAll = useCallback(() => {
    clearFiltersFromStorage();
    const defaults = getMesRhDates();
    setSearchParams({ dataInicio: defaults.ini, dataFim: defaults.fim });
  }, [setSearchParams]);

  const handlePagination = useCallback(
    (model: { page: number; pageSize: number }) => {
      updateParams({ page: String(model.page), limit: String(model.pageSize) });
    },
    [updateParams],
  );

  return {
    dataInicio, dataFim, codparc, rdomotivocod,
    page, limit, tab, density, coddep, codfuncao, orderBy, orderDir,
    listParams, filterParams,
    updateParams, clearAll, handlePagination,
  };
}
