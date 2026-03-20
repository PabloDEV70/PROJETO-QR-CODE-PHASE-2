import { useState, useCallback, useMemo } from 'react';
import { Box } from '@mui/material';
import { useHstVeiList } from '@/hooks/use-hstvei-crud';
import { HstVeiToolbar } from '@/components/crud/hstvei-toolbar';
import { HstVeiDataGrid } from '@/components/crud/hstvei-data-grid';
import { HstVeiFormDrawer } from '@/components/crud/hstvei-form-drawer';
import { HstVeiEncerrarDialog } from '@/components/crud/hstvei-encerrar-dialog';
import type { StatusFilter } from '@/components/crud/hstvei-toolbar';
import type { HstVeiRow, HstVeiListParams } from '@/api/hstvei-crud';

const DRAWER_W = 500;

export function CrudPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ativas');
  const [depFilters, setDepFilters] = useState<number[]>([]);
  const [priFilter, setPriFilter] = useState<number | ''>('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editRow, setEditRow] = useState<HstVeiRow | null>(null);
  const [encerrarRow, setEncerrarRow] = useState<HstVeiRow | null>(null);

  const params = useMemo<HstVeiListParams>(() => ({
    page,
    limit: pageSize,
    ativas: statusFilter === 'ativas' ? 'true' : statusFilter === 'encerradas' ? 'false' : undefined,
    ...(depFilters.length === 1 && { coddep: depFilters[0] }),
    ...(priFilter !== '' && { idpri: priFilter }),
    orderBy: 'DTINICIO',
    orderDir: 'DESC',
  }), [page, pageSize, statusFilter, depFilters, priFilter]);

  const { data, isLoading } = useHstVeiList(params);

  const filteredRows = useMemo(() => {
    let rows = data?.data ?? [];
    if (depFilters.length > 1) {
      rows = rows.filter((r) => depFilters.includes(r.situacaoCoddep));
    }
    if (search.trim()) {
      const term = search.trim().toLowerCase();
      rows = rows.filter((r) =>
        r.placa?.toLowerCase().includes(term) ||
        r.veiculoTag?.toLowerCase().includes(term) ||
        r.DESCRICAO?.toLowerCase().includes(term),
      );
    }
    return rows;
  }, [data?.data, depFilters, search]);

  const handleNova = useCallback(() => {
    setEditRow(null);
    setDrawerOpen(true);
  }, []);

  const handleRowClick = useCallback((row: HstVeiRow) => {
    setEditRow(row);
    setDrawerOpen(true);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setDrawerOpen(false);
    setEditRow(null);
  }, []);

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <HstVeiToolbar
        statusFilter={statusFilter} onStatusFilter={(v) => { setStatusFilter(v); setPage(1); }}
        depFilters={depFilters} onDepFilters={(v) => { setDepFilters(v); setPage(1); }}
        priFilter={priFilter} onPriFilter={(v) => { setPriFilter(v); setPage(1); }}
        search={search} onSearch={setSearch}
        onNova={handleNova}
      />

      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <Box sx={{ flex: 1, overflow: 'hidden', transition: 'margin 0.2s', mr: drawerOpen ? `${DRAWER_W}px` : 0 }}>
          <HstVeiDataGrid
            rows={filteredRows}
            loading={isLoading}
            total={data?.meta?.totalRegistros ?? 0}
            page={page}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
            onRowClick={handleRowClick}
          />
        </Box>

        <HstVeiFormDrawer open={drawerOpen} onClose={handleCloseDrawer} editRow={editRow} />
      </Box>

      <HstVeiEncerrarDialog
        open={!!encerrarRow}
        row={encerrarRow}
        onClose={() => setEncerrarRow(null)}
      />
    </Box>
  );
}
