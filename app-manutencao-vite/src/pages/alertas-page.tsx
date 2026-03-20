import { useState } from 'react';
import {
  Box, Typography, Paper, Grid, Chip, CircularProgress,
  ToggleButton, ToggleButtonGroup, Stack,
} from '@mui/material';
import { WarningAmber, DirectionsCar } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useAlertas, useVeiculosMultiplasOs } from '@/hooks/use-manutencao';
import type { OsAlerta, VeiculoMultiplasOs } from '@/types/os-types';

type FilterTipo = 'todas' | 'CRITICO' | 'ATENCAO' | 'BLOQUEIO';

const TIPO_COLOR: Record<string, string> = {
  CRITICO: '#ef4444',
  ATENCAO: '#f59e0b',
  BLOQUEIO: '#9333ea',
};

const TIPO_BG: Record<string, string> = {
  CRITICO: '#fee2e2',
  ATENCAO: '#fef3c7',
  BLOQUEIO: '#f3e8ff',
};

const TIPO_LABEL: Record<string, string> = {
  CRITICO: 'Critico',
  ATENCAO: 'Atencao',
  BLOQUEIO: 'Bloqueio',
};

function AlertaCard({ alerta }: { alerta: OsAlerta }) {
  const color = TIPO_COLOR[alerta.tipo] ?? '#9e9e9e';
  const bg = TIPO_BG[alerta.tipo] ?? '#f5f5f5';
  return (
    <Paper sx={{ p: 2, borderLeft: `4px solid ${color}` }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Link to={`/ordens-de-servico/${alerta.nuos}`} style={{ fontWeight: 700, color, textDecoration: 'none', fontSize: 14 }}>
              OS #{alerta.nuos}
            </Link>
            <Chip
              label={TIPO_LABEL[alerta.tipo] ?? alerta.tipo}
              size="small"
              sx={{ bgcolor: bg, color, fontWeight: 600, fontSize: 11 }}
            />
          </Box>
          <Typography variant="body2" fontWeight={600}>{alerta.placa ?? '—'}</Typography>
          <Typography variant="caption" color="text.secondary">{alerta.mensagem}</Typography>
        </Box>
        <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
          <Typography variant="body2" fontWeight={700} color={color}>{alerta.diasAtraso}d atraso</Typography>
        </Box>
      </Box>
      {alerta.manutencao && (
        <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
          Tipo: <strong>{alerta.manutencao}</strong>
        </Typography>
      )}
    </Paper>
  );
}

function VeiculoMultiplasCard({ veiculo }: { veiculo: VeiculoMultiplasOs }) {
  return (
    <Paper sx={{ p: 2, borderLeft: '4px solid #f59e0b', display: 'flex', alignItems: 'center', gap: 2 }}>
      <DirectionsCar sx={{ color: '#f59e0b', fontSize: 32 }} />
      <Box sx={{ flex: 1 }}>
        <Typography variant="subtitle2" fontWeight={700}>{veiculo.placa ?? '—'}</Typography>
      </Box>
      <Box sx={{ textAlign: 'right' }}>
        <Typography variant="body2" fontWeight={700} color="#f59e0b">{veiculo.qtdOsAtivas} OS ativas</Typography>
      </Box>
    </Paper>
  );
}

export function AlertasPage() {
  const [filter, setFilter] = useState<FilterTipo>('todas');
  const { data: alertas = [], isLoading: alertasLoading } = useAlertas();
  const { data: multiplasOs = [], isLoading: multiplasLoading } = useVeiculosMultiplasOs();

  const criticos = alertas.filter((a) => a.tipo === 'CRITICO');
  const atencao = alertas.filter((a) => a.tipo === 'ATENCAO');
  const bloqueio = alertas.filter((a) => a.tipo === 'BLOQUEIO');

  const filtered = filter === 'todas' ? alertas : alertas.filter((a) => a.tipo === filter);

  const summaryItems = [
    { label: 'Criticos', count: criticos.length, color: '#ef4444', bg: '#fee2e2' },
    { label: 'Atencao', count: atencao.length, color: '#f59e0b', bg: '#fef3c7' },
    { label: 'Bloqueio', count: bloqueio.length, color: '#9333ea', bg: '#f3e8ff' },
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Alertas de Manutencao
      </Typography>

      {/* Summary */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {summaryItems.map((item) => (
          <Grid key={item.label} size={{ xs: 4, sm: 4 }}>
            <Paper sx={{ p: 2, textAlign: 'center', borderTop: `3px solid ${item.color}` }}>
              <Typography variant="h4" fontWeight={700} sx={{ color: item.color }}>{item.count}</Typography>
              <Typography variant="body2" color="text.secondary">{item.label}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Filter */}
      <Box sx={{ mb: 2 }}>
        <ToggleButtonGroup
          value={filter}
          exclusive
          onChange={(_, v) => v && setFilter(v)}
          size="small"
        >
          <ToggleButton value="todas">Todas ({alertas.length})</ToggleButton>
          <ToggleButton value="CRITICO" sx={{ color: '#ef4444' }}>Criticos ({criticos.length})</ToggleButton>
          <ToggleButton value="ATENCAO" sx={{ color: '#f59e0b' }}>Atencao ({atencao.length})</ToggleButton>
          <ToggleButton value="BLOQUEIO" sx={{ color: '#9333ea' }}>Bloqueio ({bloqueio.length})</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Alert Cards */}
      {alertasLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : filtered.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <WarningAmber sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
          <Typography color="text.secondary">Nenhum alerta nesta categoria</Typography>
        </Paper>
      ) : (
        <Stack spacing={1.5} sx={{ mb: 4 }}>
          {filtered.map((alerta, idx) => (
            <AlertaCard key={`${alerta.nuos}-${idx}`} alerta={alerta} />
          ))}
        </Stack>
      )}

      {/* Veiculos com Multiplas OS */}
      {(multiplasOs.length > 0 || multiplasLoading) && (
        <Box>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5 }}>
            Veiculos com Multiplas OS
          </Typography>
          {multiplasLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <Stack spacing={1}>
              {multiplasOs.map((v) => (
                <VeiculoMultiplasCard key={v.codveiculo} veiculo={v} />
              ))}
            </Stack>
          )}
        </Box>
      )}
    </Box>
  );
}
