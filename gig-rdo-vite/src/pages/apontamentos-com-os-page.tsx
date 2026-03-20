import { useCallback, useState } from 'react';
import { Stack } from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import type { GridPaginationModel } from '@mui/x-data-grid';
import { PageLayout } from '@/components/layout/page-layout';
import { ComOsDataGrid } from '@/components/apontamentos/com-os-data-grid';
import { useApontamentosComOs, useApontamentosResumo } from '@/hooks/use-apontamentos';

export function ApontamentosComOsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  const resumoQuery = useApontamentosResumo();
  const query = useApontamentosComOs({ page, limit: pageSize });

  const handlePageChange = useCallback((model: GridPaginationModel) => {
    setPage(model.page + 1);
    setPageSize(model.pageSize);
  }, []);

  return (
    <PageLayout
      title="Com OS"
      subtitle="Servicos de apontamento que geraram Ordem de Servico"
      icon={CheckCircle}
    >
      <Stack spacing={2}>
        <ComOsDataGrid
          rows={query.data ?? []}
          total={resumoQuery.data?.TOTAL_COM_OS ?? 0}
          page={page}
          pageSize={pageSize}
          isLoading={query.isLoading}
          onPageChange={handlePageChange}
        />
      </Stack>
    </PageLayout>
  );
}
