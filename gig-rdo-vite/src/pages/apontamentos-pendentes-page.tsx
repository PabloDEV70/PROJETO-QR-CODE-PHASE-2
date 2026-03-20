import { useCallback, useState } from 'react';
import { Stack } from '@mui/material';
import { PendingActions } from '@mui/icons-material';
import type { GridPaginationModel } from '@mui/x-data-grid';
import { PageLayout } from '@/components/layout/page-layout';
import { PendentesDataGrid } from '@/components/apontamentos/pendentes-data-grid';
import { useApontamentosPendentes, useApontamentosResumo } from '@/hooks/use-apontamentos';

export function ApontamentosPendentesPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  const resumoQuery = useApontamentosResumo();
  const query = useApontamentosPendentes({ page, limit: pageSize });

  const handlePageChange = useCallback((model: GridPaginationModel) => {
    setPage(model.page + 1);
    setPageSize(model.pageSize);
  }, []);

  return (
    <PageLayout
      title="Pendentes sem OS"
      subtitle="Servicos com GERAOS=S que ainda nao tem Ordem de Servico"
      icon={PendingActions}
    >
      <Stack spacing={2}>
        <PendentesDataGrid
          rows={query.data ?? []}
          total={resumoQuery.data?.TOTAL_PENDENTES_OS ?? 0}
          page={page}
          pageSize={pageSize}
          isLoading={query.isLoading}
          onPageChange={handlePageChange}
        />
      </Stack>
    </PageLayout>
  );
}
