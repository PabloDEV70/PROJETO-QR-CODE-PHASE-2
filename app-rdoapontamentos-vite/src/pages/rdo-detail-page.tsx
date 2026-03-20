import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Fab from '@mui/material/Fab';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import { useRdoDia } from '@/hooks/use-rdo-dia';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { ApiErrorBanner } from '@/components/shared/api-error-banner';
import { SectionTitle } from '@/components/shared/section-title';
import { RdoColaboradorHeader } from '@/components/apontamento/rdo-colaborador-header';
import { RdoStatsRow } from '@/components/apontamento/rdo-stats-row';
import { RdoJornadaCard } from '@/components/apontamento/rdo-jornada-card';
import { AtividadeTimeline } from '@/components/apontamento/atividade-timeline';
import { DetalheFormDialog } from '@/components/apontamento/detalhe-form-dialog';
import { DetalheDeleteDialog } from '@/components/apontamento/detalhe-delete-dialog';
import type { RdoDetalheItem } from '@/types/rdo-types';

export function RdoDetailPage() {
  const { codrdo } = useParams<{ codrdo: string }>();
  const navigate = useNavigate();
  const codrdoNum = Number(codrdo);
  const { metricas, detalhes, isLoading, error, refetch } = useRdoDia(codrdoNum);

  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<RdoDetalheItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<RdoDetalheItem | null>(null);

  const lastHrfim = detalhes.length > 0
    ? Math.max(...detalhes.map((d) => d.HRFIM ?? 0))
    : null;

  const handleAdd = () => {
    setEditItem(null);
    setFormOpen(true);
  };

  const handleEdit = (item: RdoDetalheItem) => {
    setEditItem(item);
    setFormOpen(true);
  };

  const handleDeleteRequest = (item: RdoDetalheItem) => {
    setFormOpen(false);
    setDeleteItem(item);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditItem(null);
  };

  const handleDeleteClose = () => {
    setDeleteItem(null);
  };

  if (isLoading) return <LoadingSkeleton message="Carregando RDO..." />;

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <ApiErrorBanner error={error} onRetry={refetch} context={`RdoDetail #${codrdo}`} />
      </Box>
    );
  }

  if (!metricas) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="text.secondary">RDO #{codrdo} nao encontrado.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pb: 10 }}>
      {/* Header nav */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton onClick={() => navigate(-1)} size="small">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" fontWeight={700}>
          RDO #{codrdo}
        </Typography>
      </Box>

      {/* Row 1: Colaborador + Jornada */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 5 }}>
          <RdoColaboradorHeader m={metricas} />
        </Grid>
        <Grid size={{ xs: 12, md: 7 }}>
          <RdoJornadaCard m={metricas} />
        </Grid>
      </Grid>

      {/* Row 2: Stats KPIs */}
      <RdoStatsRow m={metricas} />

      {/* Row 3: Atividades */}
      <SectionTitle count={detalhes.length}>Atividades do Dia</SectionTitle>
      <AtividadeTimeline items={detalhes} onEdit={handleEdit} />

      {/* FAB Add */}
      <Fab
        color="primary"
        onClick={handleAdd}
        aria-label="Adicionar atividade"
        sx={{
          position: 'fixed',
          bottom: 'calc(80px + env(safe-area-inset-bottom, 0px))',
          right: 16,
          zIndex: 1200,
        }}
      >
        <AddIcon />
      </Fab>

      {/* Form Dialog */}
      <DetalheFormDialog
        open={formOpen}
        onClose={handleFormClose}
        codrdo={codrdoNum}
        editItem={editItem}
        lastHrfim={lastHrfim}
        onDelete={handleDeleteRequest}
      />

      {/* Delete Dialog */}
      <DetalheDeleteDialog
        open={deleteItem != null}
        onClose={handleDeleteClose}
        codrdo={codrdoNum}
        item={deleteItem}
      />
    </Box>
  );
}

export default RdoDetailPage;
