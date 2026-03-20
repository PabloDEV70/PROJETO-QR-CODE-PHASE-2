/**
 * Extracts all data-fetching hooks used by rdo-list-page into a single
 * composable hook, keeping the page file under 200 lines.
 */
import { useMemo } from 'react';
import { useRdoList, useRdoDetalhes, useRdoResumo, useMotivosOptions } from '@/hooks/use-rdo';
import {
  useRdoComparativo, useRdoMotivos, useRdoTimeline, useRdoProdutividade,
} from '@/hooks/use-rdo-analytics';
import { useRdoAssiduidade } from '@/hooks/use-rdo-extra';
import type { RdoDetalhesParams, RdoListParams } from '@/types/rdo-types';

interface PageQueryParams {
  listParams: RdoListParams;
  filterParams: Omit<RdoDetalhesParams, 'page' | 'limit'>;
  apiFilterParams: Record<string, string | number>;
  tab: number;
  rdomotivocod?: string;
}

export function useRdoPageQueries(p: PageQueryParams) {
  const rdoList = useRdoList(p.listParams);
  const detalhesParams = useMemo(() => {
    if (p.tab !== 1) return {};
    return { ...p.listParams, ...(p.rdomotivocod ? { rdomotivocod: p.rdomotivocod } : {}) };
  }, [p.tab, p.listParams, p.rdomotivocod]);
  const detalhes = useRdoDetalhes(detalhesParams);
  const resumo = useRdoResumo(p.filterParams);
  const comparativo = useRdoComparativo(p.apiFilterParams);
  const rdoMotivos = useRdoMotivos(p.filterParams);
  const timeline = useRdoTimeline(p.apiFilterParams);
  const motivosOpts = useMotivosOptions();
  const produtividade = useRdoProdutividade(p.apiFilterParams);
  const assiduidade = useRdoAssiduidade(p.apiFilterParams);

  return {
    rdoList, detalhes, resumo, comparativo, rdoMotivos,
    timeline, motivosOpts, produtividade, assiduidade,
  };
}
