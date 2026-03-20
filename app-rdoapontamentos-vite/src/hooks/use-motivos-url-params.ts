import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { GridSortModel } from '@mui/x-data-grid';
import type { MotivosListParams } from '@/types/rdo-types';

const STORAGE_KEY = 'rdoapontamentos-motivos-filters';

function loadSaved(): Record<string, string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function persist(params: Record<string, string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(params));
}

export function useMotivosUrlParams() {
  const [searchParams, setSearchParams] = useSearchParams(
    new URLSearchParams(loadSaved()),
  );

  const page = Number(searchParams.get('page') || '0');
  const limit = Number(searchParams.get('limit') || '25');
  const orderBy = searchParams.get('orderBy') || 'RDOMOTIVOCOD';
  const orderDir = (searchParams.get('orderDir') || 'ASC') as 'ASC' | 'DESC';
  const ativo = (searchParams.get('ativo') || '') as 'S' | 'N' | '';

  const params: MotivosListParams = {
    page: page + 1,
    limit,
    orderBy,
    orderDir,
    ...(ativo ? { ativo: ativo as 'S' | 'N' } : {}),
  };

  const sortModel = useMemo<GridSortModel>(
    () => [{ field: orderBy, sort: orderDir === 'ASC' ? 'asc' : 'desc' }],
    [orderBy, orderDir],
  );

  const updateParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        for (const [k, v] of Object.entries(updates)) {
          if (v === undefined || v === '') next.delete(k);
          else next.set(k, v);
        }
        const obj: Record<string, string> = {};
        next.forEach((v, k) => { obj[k] = v; });
        persist(obj);
        return next;
      });
    },
    [setSearchParams],
  );

  const handleSortModelChange = useCallback(
    (model: GridSortModel) => {
      if (model.length > 0) {
        updateParams({
          orderBy: model[0].field,
          orderDir: model[0].sort === 'desc' ? 'DESC' : 'ASC',
          page: '0',
        });
      } else {
        updateParams({ orderBy: undefined, orderDir: undefined, page: '0' });
      }
    },
    [updateParams],
  );

  const clearAll = useCallback(() => {
    setSearchParams({});
    localStorage.removeItem(STORAGE_KEY);
  }, [setSearchParams]);

  return {
    page, limit, orderBy, orderDir, ativo,
    params, sortModel, updateParams, handleSortModelChange, clearAll,
  };
}
