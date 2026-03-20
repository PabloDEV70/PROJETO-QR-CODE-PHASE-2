import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getMesRhDates } from '@/utils/date-helpers';
import {
  saveChamadosFilters,
  loadChamadosFilters,
  clearChamadosFilters,
} from '@/utils/chamados-filter-storage';
import type { ChamadosListParams } from '@/types/chamados-types';

export function useChamadosUrlParams() {
  const [searchParams, setSearchParams] = useSearchParams();
  const didRestore = useRef(false);
  const mesRh = useMemo(() => getMesRhDates(), []);

  useEffect(() => {
    if (didRestore.current) return;
    didRestore.current = true;
    const hasDate = searchParams.has('dataInicio') && searchParams.has('dataFim');
    if (hasDate) return;
    const saved = loadChamadosFilters();
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (saved) {
        for (const [key, val] of Object.entries(saved)) {
          if (!next.has(key)) next.set(key, val);
        }
      }
      if (!next.has('dataInicio')) next.set('dataInicio', mesRh.ini);
      if (!next.has('dataFim')) next.set('dataFim', mesRh.fim);
      return next;
    }, { replace: true });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    saveChamadosFilters(searchParams);
  }, [searchParams]);

  const dataInicio = searchParams.get('dataInicio') || mesRh.ini;
  const dataFim = searchParams.get('dataFim') || mesRh.fim;
  const status = searchParams.get('status') || '';
  const prioridade = searchParams.get('prioridade') || '';
  const tipoChamado = searchParams.get('tipoChamado') || '';
  const tab = Number(searchParams.get('tab')) || 0;
  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || 50;
  const drawerNuchamado = Number(searchParams.get('chamado')) || null;
  const formMode = searchParams.get('form') as 'novo' | 'edit' | null;
  const editId = Number(searchParams.get('editId')) || null;

  const listParams = useMemo<ChamadosListParams>(() => {
    const p: ChamadosListParams = { page, limit, dataInicio, dataFim };
    if (status) p.status = status;
    if (prioridade) p.prioridade = prioridade;
    if (tipoChamado) p.tipoChamado = tipoChamado;
    return p;
  }, [page, limit, dataInicio, dataFim, status, prioridade, tipoChamado]);

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        for (const [key, val] of Object.entries(updates)) {
          if (val === null || val === '') next.delete(key);
          else next.set(key, val);
        }
        const isFilterChange = Object.keys(updates).some(
          (k) => !['page', 'tab', 'chamado'].includes(k),
        );
        if (isFilterChange && !('page' in updates)) next.delete('page');
        return next;
      });
    },
    [setSearchParams],
  );

  const clearAll = useCallback(() => {
    clearChamadosFilters();
    const defaults = getMesRhDates();
    setSearchParams({ dataInicio: defaults.ini, dataFim: defaults.fim });
  }, [setSearchParams]);

  return {
    dataInicio, dataFim, status, prioridade, tipoChamado,
    tab, page, limit, listParams, drawerNuchamado,
    formMode, editId,
    updateParams, clearAll,
  };
}
