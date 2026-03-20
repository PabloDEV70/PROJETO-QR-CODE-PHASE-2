import { useState, useMemo } from 'react';

import { Stack } from '@mui/material';
import { LocalShipping } from '@mui/icons-material';

import { PageLayout } from '@/components/layout/page-layout';
import { VeiculoDataGrid } from '@/components/veiculo/veiculo-data-grid';
import { VeiculoKpiRow } from '@/components/veiculo/veiculo-kpi-row';
import { VeiculoFilterBar } from '@/components/veiculo/veiculo-filter-bar';
import { useVeiculoList, useVeiculoStats } from '@/hooks/use-veiculo-list';
import type { VeiculoListFilters, VeiculoListItem } from '@/types/veiculo-list-types';

export function VeiculoListPage() {
  const [filters, setFilters] = useState<VeiculoListFilters>({});

  const listQuery = useVeiculoList(filters);
  const statsQuery = useVeiculoStats();

  // Client-side search filter (monitoramento endpoint doesn't support text search)
  const filteredRows = useMemo(() => {
    const rows = listQuery.data ?? [];
    if (!filters.searchTerm) return rows;
    const term = filters.searchTerm.toLowerCase();
    return rows.filter((v: VeiculoListItem) =>
      v.placa?.toLowerCase().includes(term) ||
      v.marcaModelo?.toLowerCase().includes(term) ||
      v.tag?.toLowerCase().includes(term) ||
      String(v.codveiculo).includes(term),
    );
  }, [listQuery.data, filters.searchTerm]);

  // Extract unique categories from data for filter dropdown
  const categorias = useMemo(() => {
    if (!listQuery.data) return [];
    const cats = new Set(listQuery.data.map((v: VeiculoListItem) => v.categoria).filter(Boolean));
    return Array.from(cats).sort();
  }, [listQuery.data]);

  return (
    <PageLayout
      title="Veiculos"
      subtitle="Monitoramento e gestao da frota"
      icon={LocalShipping}
    >
      <Stack spacing={2.5}>
        <VeiculoFilterBar
          filters={filters}
          onFiltersChange={setFilters}
          categorias={categorias}
          total={filteredRows.length}
          isLoading={listQuery.isLoading}
        />

        <VeiculoKpiRow
          stats={statsQuery.data}
          isLoading={statsQuery.isLoading}
        />

        <VeiculoDataGrid
          rows={filteredRows}
          isLoading={listQuery.isLoading}
        />
      </Stack>
    </PageLayout>
  );
}
