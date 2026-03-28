import { useSearchParams } from 'react-router-dom';
import { useCallback, useMemo } from 'react';

export interface CorridasUrlParams {
  status: string;
  motorista: string;
  solicitante: string;
  codparc: string;
  buscarLevar: string;
  dataInicio: string;
  dataFim: string;
  search: string;
  page: number;
  limit: number;
  sortField: string;
  sortDir: 'ASC' | 'DESC';
  corrida: number | null;
  form: string;
}

const DEFAULTS = {
  status: '',
  motorista: '',
  solicitante: '',
  codparc: '',
  buscarLevar: '',
  dataInicio: '',
  dataFim: '',
  search: '',
  page: 0,
  limit: 50,
  sortField: 'ID',
  sortDir: 'DESC' as const,
  corrida: null as number | null,
  form: '',
};

export function useCorridasUrlParams() {
  const [searchParams, setSearchParams] = useSearchParams();

  const params: CorridasUrlParams = useMemo(() => ({
    status: searchParams.get('status') ?? DEFAULTS.status,
    motorista: searchParams.get('motorista') ?? DEFAULTS.motorista,
    solicitante: searchParams.get('solicitante') ?? DEFAULTS.solicitante,
    codparc: searchParams.get('codparc') ?? DEFAULTS.codparc,
    buscarLevar: searchParams.get('buscarLevar') ?? DEFAULTS.buscarLevar,
    dataInicio: searchParams.get('dataInicio') ?? DEFAULTS.dataInicio,
    dataFim: searchParams.get('dataFim') ?? DEFAULTS.dataFim,
    search: searchParams.get('search') ?? DEFAULTS.search,
    page: Number(searchParams.get('page') ?? DEFAULTS.page),
    limit: Number(searchParams.get('limit') ?? DEFAULTS.limit),
    sortField: searchParams.get('sortField') ?? DEFAULTS.sortField,
    sortDir: (searchParams.get('sortDir') as 'ASC' | 'DESC') ?? DEFAULTS.sortDir,
    corrida: searchParams.get('corrida') ? Number(searchParams.get('corrida')) : DEFAULTS.corrida,
    form: searchParams.get('form') ?? DEFAULTS.form,
  }), [searchParams]);

  const setParam = useCallback((key: string, value: string | number | null) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      const defaultVal = DEFAULTS[key as keyof typeof DEFAULTS];
      if (value === null || value === '' || value === defaultVal) {
        next.delete(key);
      } else {
        next.set(key, String(value));
      }
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  const setParams = useCallback((updates: Record<string, string | number | null>) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      for (const [key, value] of Object.entries(updates)) {
        const defaultVal = DEFAULTS[key as keyof typeof DEFAULTS];
        if (value === null || value === '' || value === defaultVal) {
          next.delete(key);
        } else {
          next.set(key, String(value));
        }
      }
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  const clearFilters = useCallback(() => {
    setSearchParams(new URLSearchParams(), { replace: true });
  }, [setSearchParams]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (params.status) count++;
    if (params.motorista) count++;
    if (params.solicitante) count++;
    if (params.codparc) count++;
    if (params.buscarLevar) count++;
    if (params.dataInicio) count++;
    if (params.dataFim) count++;
    if (params.search) count++;
    return count;
  }, [params]);

  return { params, setParam, setParams, clearFilters, activeFilterCount };
}
