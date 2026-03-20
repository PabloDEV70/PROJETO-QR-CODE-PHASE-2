import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Grid, Chip, CircularProgress, Alert, InputAdornment, TextField,
} from '@mui/material';
import { Search, DirectionsCar, Build, CheckCircle, Warning } from '@mui/icons-material';
import { useFrotaStatus, useFrotaManutencoesUrgentes } from '@/hooks/use-manutencao';
import type { ManutencaoUrgente } from '@/types/os-types';

function SummaryCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  return (
    <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
      <Box sx={{ color, display: 'flex' }}>{icon}</Box>
      <Box>
        <Typography variant="h5" fontWeight={700}>{value}</Typography>
        <Typography variant="body2" color="text.secondary">{label}</Typography>
      </Box>
    </Paper>
  );
}

function UrgentCard({ item }: { item: ManutencaoUrgente }) {
  return (
    <Paper variant="outlined" sx={{ p: 2, borderColor: 'error.main', borderWidth: 2 }}>
      <Typography fontWeight={700}>{item.placa}</Typography>
      {item.adTag && <Typography variant="caption" color="text.secondary">Tag: {item.adTag}</Typography>}
      {item.statusGig && <Typography variant="body2" color="text.secondary">Status: {item.statusGig}</Typography>}
      <Typography variant="caption" color="error">{item.diasAberto} dia(s) aberto</Typography>
    </Paper>
  );
}

export function FrotaPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const { data: frotaData, isLoading: loadingFrota } = useFrotaStatus();
  const { data: urgentes = [], isLoading: loadingUrgentes } = useFrotaManutencoesUrgentes();

  const resumo = frotaData?.resumo;
  const porStatusList = frotaData?.porStatus ?? [];

  // Flatten veiculos from porStatus for the list
  const allVeiculos = porStatusList.flatMap((s) =>
    s.veiculos.map((v) => ({ ...v, statusGroup: s.status })),
  );

  const filtered = search
    ? allVeiculos.filter((v) =>
        v.placa.toLowerCase().includes(search.toLowerCase()) ||
        (v.adTag ?? '').toLowerCase().includes(search.toLowerCase())
      )
    : allVeiculos;

  if (loadingFrota || loadingUrgentes) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography variant="h5" fontWeight={700}>
        Frota
      </Typography>

      {/* Summary */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <SummaryCard icon={<DirectionsCar />} label="Total de Veiculos" value={resumo?.totalVeiculos ?? 0} color="text.primary" />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <SummaryCard icon={<Build />} label="Em Manutencao" value={resumo?.emManutencao ?? 0} color="warning.main" />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <SummaryCard icon={<CheckCircle />} label="Operacionais" value={resumo?.operacionais ?? 0} color="success.main" />
        </Grid>
      </Grid>

      {/* Urgentes */}
      {urgentes.length > 0 && (
        <Box>
          <Alert severity="warning" icon={<Warning />} sx={{ mb: 2 }}>
            {urgentes.length} veiculo(s) precisam de atencao imediata
          </Alert>
          <Grid container spacing={2}>
            {urgentes.map((item) => (
              <Grid key={item.codveiculo} size={{ xs: 12, sm: 6, md: 4 }}>
                <UrgentCard item={item} />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Status Breakdown */}
      {porStatusList.length > 0 && (
        <Box>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>Por Status</Typography>
          <Grid container spacing={1}>
            {porStatusList.map((s) => (
              <Grid key={s.status} size="auto">
                <Chip
                  label={`${s.status}: ${s.count} (${s.percent.toFixed(0)}%)`}
                  size="small"
                  variant="outlined"
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Veiculos List */}
      <Paper>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1" fontWeight={600}>Todos os Veiculos ({allVeiculos.length})</Typography>
          <TextField
            size="small"
            placeholder="Buscar por placa, tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ width: 280 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </Box>
        <Box sx={{ maxHeight: 500, overflow: 'auto' }}>
          {filtered.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">Nenhum veiculo encontrado</Typography>
            </Box>
          ) : filtered.map((v) => (
            <Box
              key={v.codveiculo}
              onClick={() => navigate(`/frota/${v.codveiculo}`)}
              sx={{
                p: 2, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 2,
                borderBottom: '1px solid', borderColor: 'divider',
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <DirectionsCar sx={{ color: 'text.secondary' }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" fontWeight={600}>{v.placa}</Typography>
                {v.adTag && <Typography variant="caption" color="text.secondary">{v.adTag}</Typography>}
              </Box>
              <Chip label={v.statusGroup} size="small" variant="outlined" />
            </Box>
          ))}
        </Box>
      </Paper>
    </Box>
  );
}
