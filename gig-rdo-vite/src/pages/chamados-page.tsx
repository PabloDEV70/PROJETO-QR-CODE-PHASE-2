import { useState } from 'react';
import { Box, Tabs, Tab, Stack, Button } from '@mui/material';
import { Add } from '@mui/icons-material';
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
    listParams, drawerNuchamado, updateParams, clearAll,
  } = useChamadosUrlParams();

  const [formOpen, setFormOpen] = useState(false);
  const [editNuchamado, setEditNuchamado] = useState<number | null>(null);

  const kanbanQuery = useChamadosKanban();
  const listQuery = useChamadosList(listParams);
  const resumoQuery = useChamadosResumo();
  const setorQuery = useChamadosPorSetor();
  const { data: editChamado } = useChamadoById(editNuchamado);

  const handleCardClick = (nuchamado: number) => {
    updateParams({ chamado: String(nuchamado) });
  };

  const handleDrawerClose = () => {
    updateParams({ chamado: null });
  };

  const handleNewChamado = () => {
    setEditNuchamado(null);
    setFormOpen(true);
  };

  const handleEditChamado = (nuchamado: number) => {
    setEditNuchamado(nuchamado);
    setFormOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditNuchamado(null);
  };

  const isLoading = kanbanQuery.isLoading || listQuery.isLoading;

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
        <Box sx={{ flex: 1 }}>
          <ChamadosToolbar
            dataInicio={dataInicio}
            dataFim={dataFim}
            status={status}
            prioridade={prioridade}
            onUpdateParams={updateParams}
            onClearAll={clearAll}
            totalRegistros={resumoQuery.data?.total}
            isLoading={isLoading}
          />
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleNewChamado}
          sx={{
            borderRadius: '12px', textTransform: 'none',
            whiteSpace: 'nowrap', minWidth: 'auto', px: 2,
          }}
          size="small"
        >
          Novo
        </Button>
      </Stack>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 1.5 }}>
        <Tabs value={tab}
          onChange={(_, v) => updateParams({ tab: v === 0 ? null : String(v) })}>
          <Tab label="Kanban" />
          <Tab label="Lista" />
          <Tab label="Dashboard" />
        </Tabs>
      </Box>

      <Box sx={{ pt: 2 }}>
        {tab === 0 && (
          <KanbanBoard
            columns={kanbanQuery.data ?? []}
            isLoading={kanbanQuery.isLoading}
            onCardClick={handleCardClick}
          />
        )}
        {tab === 1 && (
          <ChamadosDataGrid
            chamados={listQuery.data ?? []}
            isLoading={listQuery.isLoading}
            onRowClick={handleCardClick}
          />
        )}
        {tab === 2 && (
          <Stack spacing={3}>
            <ChamadosKpiRow
              resumo={resumoQuery.data}
              isLoading={resumoQuery.isLoading}
            />
            <ChamadosPorSetorChart
              setores={setorQuery.data ?? []}
              isLoading={setorQuery.isLoading}
            />
          </Stack>
        )}
      </Box>

      <ChamadoDrawer
        open={drawerNuchamado !== null}
        onClose={handleDrawerClose}
        nuchamado={drawerNuchamado}
        onEdit={handleEditChamado}
      />

      <ChamadoFormDrawer
        open={formOpen}
        onClose={handleFormClose}
        chamado={editNuchamado ? editChamado : null}
      />
    </Box>
  );
}
