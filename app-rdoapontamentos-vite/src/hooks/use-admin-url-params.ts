import { useCallback, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { GridSortModel } from '@mui/x-data-grid';
import { getMesRhDates } from '@/utils/date-presets';

const STORAGE_KEY = 'rdoapontamentos-admin-filters';
const PERSISTED_KEYS = ['dataInicio', 'dataFim', 'limit', 'orderBy', 'orderDir'] as const;

function loadSaved(): Record<string, string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function persist(params: URLSearchParams) {
  const obj: Record<string, string> = {};
  for (const key of PERSISTED_KEYS) {
    const val = params.get(key);
    if (val) obj[key] = val;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
}

export function useAdminUrlParams() {
  const didRestore = useRef(false);

  const defaultParams = (() => {
    const saved = loadSaved();
    if (saved.dataInicio && saved.dataFim) return saved;
    const { ini, fim } = getMesRhDates();
    return { dataInicio: ini, dataFim: fim };
  })();

  const [searchParams, setSearchParams] = useSearchParams(defaultParams);

  // Persist on first restore
  if (!didRestore.current) {
    didRestore.current = true;
    persist(searchParams);
  }

  const dataInicio = searchParams.get('dataInicio') ?? '';
  const dataFim = searchParams.get('dataFim') ?? '';
  const page = Number(searchParams.get('page') ?? '0');
  const limit = Number(searchParams.get('limit') ?? '25');
  const orderBy = searchParams.get('orderBy') ?? 'DTREF';
  const orderDir = (searchParams.get('orderDir') ?? 'DESC') as 'ASC' | 'DESC';

  const sortModel = useMemo<GridSortModel>(
    () => [{ field: orderBy, sort: orderDir === 'ASC' ? 'asc' : 'desc' }],
    [orderBy, orderDir],
  );

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        for (const [key, val] of Object.entries(updates)) {
          if (val === null || val === '') next.delete(key);
          else next.set(key, val);
        }
        // Reset page when non-page params change
        if (!('page' in updates)) next.delete('page');
        persist(next);
        return next;
      });
    },
    [setSearchParams],
  );

  const clearAll = useCallback(() => {
    const { ini, fim } = getMesRhDates();
    setSearchParams(new URLSearchParams({ dataInicio: ini, dataFim: fim }));
    localStorage.removeItem(STORAGE_KEY);
  }, [setSearchParams]);

  const handlePagination = useCallback(
    (model: { page: number; pageSize: number }) => {
      updateParams({
        page: model.page > 0 ? String(model.page) : null,
        limit: model.pageSize !== 25 ? String(model.pageSize) : null,
      });
    },
    [updateParams],
  );

  const handleSortModelChange = useCallback(
    (model: GridSortModel) => {
      if (model.length > 0) {
        updateParams({
          orderBy: model[0].field,
          orderDir: model[0].sort === 'desc' ? 'DESC' : 'ASC',
          page: null,
        });
      } else {
        updateParams({ orderBy: null, orderDir: null, page: null });
      }
    },
    [updateParams],
  );

  return {
    dataInicio,
    dataFim,
    page,
    limit,
    orderBy,
    orderDir,
    sortModel,
    listParams: {
      dataInicio: dataInicio || undefined,
      dataFim: dataFim || undefined,
      page: page + 1,
      limit,
      orderBy,
      orderDir,
    },
    updateParams,
    clearAll,
    handlePagination,
    handleSortModelChange,
  };
}
