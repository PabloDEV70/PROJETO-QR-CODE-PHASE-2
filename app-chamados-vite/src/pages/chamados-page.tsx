import { Box, Tabs, Tab, Stack, Button, IconButton, useMediaQuery, useTheme } from '@mui/material';
import { Add, ViewKanbanRounded, ListRounded, DashboardRounded } from '@mui/icons-material';
import { ChamadosToolbar } from '@/components/chamados/chamados-toolbar';
import { KanbanBoard } from '@/components/chamados/kanban-board';
import { ChamadosDataGrid } from '@/components/chamados/chamados-data-grid';
import { ChamadosKpiRow } from '@/components/chamados/chamados-kpi-row';
import { ChamadosPorSetorChart } from '@/components/chamados/chamados-por-setor-chart';
import { ChamadoDrawer } from '@/components/chamados/chamado-drawer';
import { ChamadoFormDrawer } from '@/components/chamados/chamado-form-drawer';
import {
  useChamadosKanban,
  useChamadosList,
  useChamadosResumo,
  useChamadosPorSetor,
  useChamadoById,
} from '@/hooks/use-chamados';
import { useChamadosUrlParams } from '@/hooks/use-chamados-url-params';

export function ChamadosPage() {
  const {
    dataInicio, dataFim, status, prioridade, tab,
    listParams, drawerNuchamado, formMode, editId,
    updateParams, clearAll,
  } = useChamadosUrlParams();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const kanbanQuery = useChamadosKanban();
  const listQuery = useChamadosList(listParams);
  const resumoQuery = useChamadosResumo();
  const setorQuery = useChamadosPorSetor();
  const { data: editChamado } = useChamadoById(formMode === 'edit' ? editId : null);

  const handleCardClick = (nuchamado: number) => updateParams({ chamado: String(nuchamado) });
  const handleDrawerClose = () => updateParams({ chamado: null });
  const handleNewChamado = () => updateParams({ form: 'novo', editId: null });
  const handleEditChamado = (nuchamado: number) => updateParams({ form: 'edit', editId: String(nuchamado) });
  const handleFormClose = () => updateParams({ form: null, editId: null });

  const isLoading = kanbanQuery.isLoading || listQuery.isLoading;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
      {/* Fixed tab bar */}
      <Box sx={{
        flexShrink: 0,
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        zIndex: 5,
      }}>
        <Stack direction="row" alignItems="center" sx={{ px: { xs: 1, md: 3 }, minHeight: 48 }}>
          <Tabs
            value={tab}
            onChange={(_, v) => updateParams({ tab: v === 0 ? null : String(v) })}
            variant={isMobile ? 'fullWidth' : 'standard'}
            sx={{
              minHeight: 48,
              flex: isMobile ? 1 : 'none',
              '& .MuiTab-root': {
                textTransform: 'none', fontWeight: 600, fontSize: 13,
                minHeight: 48, color: 'text.secondary',
                px: { xs: 1.5, sm: 2.5 },
                '&.Mui-selected': { color: 'text.primary' },
              },
              '& .MuiTabs-indicator': { height: 2, borderRadius: '2px 2px 0 0' },
            }}
          >
            <Tab icon={<ViewKanbanRounded sx={{ fontSize: 18 }} />} iconPosition="start" label={isMobile ? undefined : 'Kanban'} />
            <Tab icon={<ListRounded sx={{ fontSize: 18 }} />} iconPosition="start" label={isMobile ? undefined : 'Lista'} />
            <Tab icon={<DashboardRounded sx={{ fontSize: 18 }} />} iconPosition="start" label={isMobile ? undefined : 'Dashboard'} />
          </Tabs>
          {!isMobile && <Box sx={{ flex: 1 }} />}
          {isMobile ? (
            <IconButton onClick={handleNewChamado} sx={{ bgcolor: 'primary.main', color: '#fff', width: 36, height: 36, '&:hover': { bgcolor: 'primary.dark' } }}>
              <Add sx={{ fontSize: 20 }} />
            </IconButton>
          ) : (
            <Button variant="contained" startIcon={<Add />} onClick={handleNewChamado} disableElevation size="small"
              sx={{ borderRadius: '8px', textTransform: 'none', px: 2.5, py: 0.75, fontWeight: 600, fontSize: 13, minHeight: 36 }}>
              Novo Chamado
            </Button>
          )}
        </Stack>
      </Box>

      {/* Fixed filter bar */}
      <Box sx={{ flexShrink: 0, zIndex: 4 }}>
        <ChamadosToolbar
          dataInicio={dataInicio} dataFim={dataFim} status={status} prioridade={prioridade}
          onUpdateParams={updateParams} onClearAll={clearAll}
          totalRegistros={resumoQuery.data?.total} isLoading={isLoading}
        />
      </Box>

      {/* Content area - each tab manages its own scroll */}
      {tab === 0 && (
        <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', px: { xs: 1, sm: 2, md: 3 }, py: 1 }}>
          <KanbanBoard columns={kanbanQuery.data ?? []} isLoading={kanbanQuery.isLoading} onCardClick={handleCardClick} />
        </Box>
      )}
      {tab === 1 && (
        <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', px: { xs: 1, sm: 2, md: 3 }, py: 1 }}>
          <ChamadosDataGrid chamados={listQuery.data ?? []} isLoading={listQuery.isLoading} onRowClick={handleCardClick} />
        </Box>
      )}
      {tab === 2 && (
        <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', px: { xs: 1, sm: 2, md: 3 }, py: 2 }}>
          <Stack spacing={3}>
            <ChamadosKpiRow resumo={resumoQuery.data} isLoading={resumoQuery.isLoading} />
            <ChamadosPorSetorChart setores={setorQuery.data ?? []} isLoading={setorQuery.isLoading} />
          </Stack>
        </Box>
      )}

      <ChamadoDrawer open={drawerNuchamado !== null} onClose={handleDrawerClose} nuchamado={drawerNuchamado} onEdit={handleEditChamado} />
      <ChamadoFormDrawer
        open={formMode !== null}
        onClose={handleFormClose}
        chamado={formMode === 'edit' ? editChamado : null}
      />
    </Box>
  );
}
