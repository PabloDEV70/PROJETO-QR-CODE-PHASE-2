import { useState, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Stack, Tabs, Tab, Alert } from '@mui/material';
import { AccountBalance } from '@mui/icons-material';

import { PageLayout } from '@/components/layout/page-layout';
import { PatrimonioKpiRow } from '@/components/patrimonio/patrimonio-kpi-row';
import { PatrimonioFilterBar } from '@/components/patrimonio/patrimonio-filter-bar';
import { PatrimonioDataGrid } from '@/components/patrimonio/patrimonio-data-grid';
import { PatrimonioDashboardCharts } from '@/components/patrimonio/patrimonio-dashboard-charts';
import { PatrimonioCardsView } from '@/components/patrimonio/patrimonio-cards-view';
import { usePatrimonioDashboard } from '@/hooks/use-patrimonio-dashboard';
import { usePatrimonioBens } from '@/hooks/use-patrimonio-bens';
import type { PatrimonioListFilters } from '@/types/patrimonio-types';

const TAB_KEYS = ['visao-geral', 'lista', 'cards'] as const;

export function PatrimonioHubPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabKey = searchParams.get('tab') || 'visao-geral';
  const tabIndex = Math.max(0, TAB_KEYS.indexOf(tabKey as (typeof TAB_KEYS)[number]));

  const [filters, setFilters] = useState<PatrimonioListFilters>({});
  const dashQuery = usePatrimonioDashboard();
  const bensQuery = usePatrimonioBens(filters);

  const setTab = useCallback((idx: number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('tab', TAB_KEYS[idx] ?? 'visao-geral');
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  const categorias = useMemo(() => {
    if (!bensQuery.data) return [];
    const cats = new Set(bensQuery.data.map((b) => (b.categoria || '').trim()).filter(Boolean));
    return Array.from(cats).sort();
  }, [bensQuery.data]);

  const filteredRows = useMemo(() => {
    const rows = bensQuery.data ?? [];
    if (!filters.search) return rows;
    const term = filters.search.toLowerCase();
    return rows.filter((b) =>
      b.tag?.toLowerCase().includes(term) ||
      b.placa?.toLowerCase().includes(term) ||
      b.descricaoAbreviada?.toLowerCase().includes(term) ||
      b.codbem?.toLowerCase().includes(term) ||
      b.marcaModelo?.toLowerCase().includes(term),
    );
  }, [bensQuery.data, filters.search]);

  return (
    <PageLayout
      title="Patrimonio"
      subtitle="Mobilizado vs Imobilizado — Gestao de bens e contratos"
      icon={AccountBalance}
    >
      <Stack spacing={2.5}>
        {dashQuery.isError && (
          <Alert severity="error" variant="outlined">
            Erro ao carregar dashboard: {dashQuery.error?.message || 'Erro desconhecido'}
          </Alert>
        )}
        {bensQuery.isError && tabIndex >= 1 && (
          <Alert severity="error" variant="outlined">
            Erro ao carregar bens: {bensQuery.error?.message || 'Erro desconhecido'}
          </Alert>
        )}

        <PatrimonioKpiRow
          kpis={dashQuery.data?.kpis}
          isLoading={dashQuery.isLoading}
        />

        <Tabs value={tabIndex} onChange={(_, v) => setTab(v)}>
          <Tab label="Visao Geral" />
          <Tab label="Lista" />
          <Tab label="Cards" />
        </Tabs>

        {tabIndex === 0 && (
          <PatrimonioDashboardCharts
            dashboard={dashQuery.data}
            isLoading={dashQuery.isLoading}
          />
        )}

        {tabIndex >= 1 && (
          <PatrimonioFilterBar
            filters={filters}
            onFiltersChange={setFilters}
            categorias={categorias}
            total={filteredRows.length}
            isLoading={bensQuery.isLoading}
          />
        )}

        {tabIndex === 1 && (
          <PatrimonioDataGrid
            rows={filteredRows}
            isLoading={bensQuery.isLoading}
          />
        )}

        {tabIndex === 2 && (
          <PatrimonioCardsView
            bens={filteredRows}
            isLoading={bensQuery.isLoading}
          />
        )}
      </Stack>
    </PageLayout>
  );
}
