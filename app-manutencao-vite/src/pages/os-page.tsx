import { useState } from 'react';
import { Box } from '@mui/material';
import { OsKanbanBoard } from '@/components/os/os-kanban-board';
import { OsDataGrid } from '@/components/os/os-data-grid';
import { OsFormDialog } from '@/components/os/os-form-dialog';
import { OsToolbarIntegrated } from '@/components/os/os-toolbar-integrated';
import { OsKpiStrip } from '@/components/os/os-kpi-strip';
import { useOsList, useOsResumo, useOsAtivas } from '@/hooks/use-ordens-servico';
import { useOsUrlParams } from '@/hooks/use-os-url-params';

export function OsPage() {
  const {
    dataInicio, dataFim, status, manutencao, statusGig, search,
    tab, page, limit, showKpis, listParams,
    setParam, clearFilters,
  } = useOsUrlParams();

  const listQuery = useOsList(listParams);
  const resumoQuery = useOsResumo(listParams);
  const ativasQuery = useOsAtivas();

  const ordens = listQuery.data?.data ?? [];
  const pagination = listQuery.data?.pagination;
  const ativas = ativasQuery.data ?? [];

  const [showForm, setShowForm] = useState(false);
  const [kanbanGroupBy, setKanbanGroupBy] = useState<'status' | 'statusGig'>('statusGig');

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
      {/* KPI Dashboard Strip */}
      {showKpis && (
        <OsKpiStrip
          resumo={resumoQuery.data}
          isLoading={resumoQuery.isLoading}
        />
      )}

      {tab === 'lista' ? (
        <OsDataGrid
          ordens={ordens}
          isLoading={listQuery.isLoading}
          page={page}
          limit={limit}
          total={pagination?.total ?? 0}
          onPageChange={(p) => setParam('page', String(p))}
          onPageSizeChange={(l) => setParam('limit', String(l))}
          tab={tab}
          onTabChange={(v) => setParam('tab', v)}
          onNewOs={() => setShowForm(true)}
          resumo={resumoQuery.data}
          filters={{ dataInicio, dataFim, status, manutencao, statusGig, search }}
          onSetFilter={setParam}
          onClearFilters={clearFilters}
          showKpis={showKpis}
          onToggleKpis={() => setParam('showKpis', showKpis ? '' : '1')}
        />
      ) : (
        <>
          <OsToolbarIntegrated
            tab={tab}
            onTabChange={(v) => setParam('tab', v)}
            onNewOs={() => setShowForm(true)}
            resumo={resumoQuery.data}
            showKpis={showKpis}
            onToggleKpis={() => setParam('showKpis', showKpis ? '' : '1')}
          />
          <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', px: { xs: 1, sm: 2, md: 3 }, py: 1 }}>
            <OsKanbanBoard
              ordens={ativas}
              isLoading={ativasQuery.isLoading}
              groupBy={kanbanGroupBy}
              onGroupByChange={setKanbanGroupBy}
            />
          </Box>
        </>
      )}

      <OsFormDialog open={showForm} onClose={() => setShowForm(false)} />
    </Box>
  );
}
