import { useState } from 'react';
import { Box, Stack, Button, ToggleButtonGroup, ToggleButton, useMediaQuery, useTheme } from '@mui/material';
import { ViewKanbanRounded, ViewListRounded, AddRounded } from '@mui/icons-material';
import { OsToolbar } from '@/components/os/os-toolbar';
import { OsKanbanBoard } from '@/components/os/os-kanban-board';
import { OsDataGrid } from '@/components/os/os-data-grid';
import { OsFormDialog } from '@/components/os/os-form-dialog';
import { useOsList, useOsResumo, useOsAtivas } from '@/hooks/use-ordens-servico';
import { useOsUrlParams } from '@/hooks/use-os-url-params';
import { useAuthStore } from '@/stores/auth-store';

export function OsPage() {
  const {
    dataInicio, dataFim, status, manutencao, statusGig, search,
    tab, page, limit, listParams,
    setParam, clearFilters,
  } = useOsUrlParams();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isProd = useAuthStore((s) => s.database) === 'PROD';

  const listQuery = useOsList(listParams);
  const resumoQuery = useOsResumo(listParams);
  const ativasQuery = useOsAtivas();

  const ordens = listQuery.data?.data ?? [];
  const pagination = listQuery.data?.pagination;
  const ativas = ativasQuery.data ?? [];

  const [showForm, setShowForm] = useState(false);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
      {/* Header bar */}
      <Box sx={{
        flexShrink: 0,
        borderBottom: '1px solid', borderColor: 'divider',
        bgcolor: 'background.paper', zIndex: 5,
        px: { xs: 1, md: 3 }, py: 0.75,
      }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <ToggleButtonGroup
            value={tab}
            exclusive
            onChange={(_, v) => { if (v) setParam('tab', v); }}
            size="small"
            sx={{
              '& .MuiToggleButton-root': {
                textTransform: 'none', fontWeight: 600, fontSize: 13,
                px: 1.5, py: 0.5, borderRadius: '4px !important',
              },
            }}
          >
            <ToggleButton value="lista">
              <ViewListRounded sx={{ fontSize: 18, mr: 0.5 }} />
              {!isMobile && 'Lista'}
            </ToggleButton>
            <ToggleButton value="kanban">
              <ViewKanbanRounded sx={{ fontSize: 18, mr: 0.5 }} />
              {!isMobile && 'Kanban'}
            </ToggleButton>
          </ToggleButtonGroup>

          <Box sx={{ flex: 1 }} />

          <Button
            variant="contained" color="success" size="small"
            startIcon={<AddRounded />}
            disabled={isProd}
            onClick={() => setShowForm(true)}
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '4px' }}
          >
            {isMobile ? 'Nova' : 'Nova OS'}
          </Button>
        </Stack>
      </Box>

      {/* Filter bar */}
      <Box sx={{ flexShrink: 0, zIndex: 4 }}>
        <OsToolbar
          dataInicio={dataInicio} dataFim={dataFim}
          status={status} manutencao={manutencao} statusGig={statusGig}
          search={search}
          onSetParam={setParam} onClearFilters={clearFilters}
          resumo={resumoQuery.data} isLoading={listQuery.isLoading}
        />
      </Box>

      {/* Content */}
      {tab === 'lista' && (
        <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          <OsDataGrid
            ordens={ordens}
            isLoading={listQuery.isLoading}
            page={page}
            limit={limit}
            total={pagination?.total ?? 0}
            onPageChange={(p) => setParam('page', String(p))}
            onPageSizeChange={(l) => setParam('limit', String(l))}
          />
        </Box>
      )}
      {tab === 'kanban' && (
        <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', px: { xs: 1, sm: 2, md: 3 }, py: 1 }}>
          <OsKanbanBoard ordens={ativas} isLoading={ativasQuery.isLoading} />
        </Box>
      )}

      <OsFormDialog open={showForm} onClose={() => setShowForm(false)} />
    </Box>
  );
}
