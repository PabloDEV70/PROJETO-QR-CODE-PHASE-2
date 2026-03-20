import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { format, subDays } from 'date-fns';

function defaultStart() {
  return format(subDays(new Date(), 30), 'yyyy-MM-dd');
}

function defaultEnd() {
  return format(new Date(), 'yyyy-MM-dd');
}

export function useAnalyticsUrlParams() {
  const [searchParams, setSearchParams] = useSearchParams();

  const dataInicio = searchParams.get('dataInicio') || defaultStart();
  const dataFim = searchParams.get('dataFim') || defaultEnd();
  const codparc = searchParams.get('codparc');
  const rdomotivocod = searchParams.get('rdomotivocod');
  const coddep = searchParams.get('coddep');

  const apiParams = useMemo(() => {
    const p: Record<string, string> = { dataInicio, dataFim };
    if (codparc) p.codparc = codparc;
    if (rdomotivocod) p.rdomotivocod = rdomotivocod;
    if (coddep) p.coddep = coddep;
    return p;
  }, [dataInicio, dataFim, codparc, rdomotivocod, coddep]);

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        for (const [key, val] of Object.entries(updates)) {
          if (val === null) next.delete(key);
          else next.set(key, val);
        }
        return next;
      });
    },
    [setSearchParams],
  );

  const clearAll = useCallback(() => {
    setSearchParams({});
  }, [setSearchParams]);

  return {
    dataInicio,
    dataFim,
    codparc,
    rdomotivocod,
    coddep,
    apiParams,
    updateParams,
    clearAll,
  };
}
