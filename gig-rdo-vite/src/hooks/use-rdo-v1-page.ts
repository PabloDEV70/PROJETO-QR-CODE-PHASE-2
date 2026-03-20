import { useState, useCallback, useMemo, useEffect } from 'react';
import type { GridPaginationModel } from '@mui/x-data-grid';
import { useRdoUrlParams } from '@/hooks/use-rdo-url-params';
import { useRdoList, useRdoDetalhes, useRdoResumo, useMotivosOptions } from '@/hooks/use-rdo';
import { useRdoComparativo, useRdoMotivos, useRdoTimeline } from '@/hooks/use-rdo-analytics';
import { useRdoDashboardData } from '@/hooks/use-rdo-dashboard';
import { useHorasEsperadas } from '@/hooks/use-horas-esperadas';
import type { Density } from '@/utils/rdo-filter-helpers';

const DEFAULT_CODDEP_MANUTENCAO = '1050000';

export function useRdoV1Page() {
  const urlParams = useRdoUrlParams();
  const {
    dataInicio, dataFim, codparc, rdomotivocod,
    tab, coddep, listParams, filterParams,
    updateParams, handlePagination,
  } = urlParams;

  useEffect(() => {
    if (!coddep) updateParams({ coddep: DEFAULT_CODDEP_MANUTENCAO });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [filtersOpen, setFiltersOpen] = useState(false);
  const motivosOpts = useMotivosOptions();
  const apiFilterParams = filterParams as Record<string, string | number>;

  const rdoList = useRdoList(listParams);
  const detalhesParams = useMemo(() => {
    if (tab !== 1) return {};
    return { ...listParams, ...(rdomotivocod ? { rdomotivocod } : {}) };
  }, [tab, listParams, rdomotivocod]);
  const detalhes = useRdoDetalhes(detalhesParams);
  const resumo = useRdoResumo(filterParams);
  const comparativo = useRdoComparativo(apiFilterParams);
  const rdoMotivos = useRdoMotivos(filterParams);
  const timeline = useRdoTimeline(apiFilterParams);
  const horasEsp = useHorasEsperadas({
    dataInicio, dataFim, coddep: coddep ?? undefined, codparc: codparc ?? undefined,
  });

  const rdoData = rdoList.data;

  const dashboard = useRdoDashboardData(
    rdoMotivos.data?.data, resumo.data?.totalMinutosPrevistos,
  );

  const activeQuery = tab === 1 ? detalhes : rdoList;

  const handleTabChange = useCallback((_: React.SyntheticEvent, v: number) => {
    updateParams({ tab: v ? String(v) : null, page: null });
  }, [updateParams]);

  const handleMotivoClick = useCallback((cod: number | null, _sigla: string) => {
    if (cod == null) return;
    updateParams({ tab: '1', rdomotivocod: String(cod), page: null });
  }, [updateParams]);

  const handleClearMotivo = useCallback(
    () => updateParams({ rdomotivocod: null }), [updateParams]);
  const handleDensity = useCallback(
    (d: Density) => updateParams({ density: d }), [updateParams]);

  const handleGridPage = useCallback((model: GridPaginationModel) => {
    handlePagination({ page: model.page + 1, pageSize: model.pageSize });
  }, [handlePagination]);

  return {
    ...urlParams, filtersOpen, setFiltersOpen, motivosOpts, apiFilterParams,
    rdoList, detalhes, resumo, comparativo, rdoMotivos, timeline, horasEsp,
    rdoData, dashboard, activeQuery,
    handleTabChange, handleMotivoClick, handleClearMotivo,
    handleDensity, handleGridPage,
  };
}
