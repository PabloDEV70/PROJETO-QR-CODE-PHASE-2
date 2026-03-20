import { Box, Chip, Paper, Stack, Tooltip, Typography } from '@mui/material';
import type { VeiculoQuadro, PreventivaQuadroItem } from '@/types/preventiva-types';

interface PreventivVehicleCardProps {
  veiculo: VeiculoQuadro;
}

const STATUS_COLORS: Record<string, string> = {
  EM_DIA: '#16A34A',
  ATRASADA: '#d32f2f',
  SEM_HISTORICO: '#9e9e9e',
  PROXIMO: '#F59E0B',
};

function getCircleColor(p: PreventivaQuadroItem): string {
  if (p.status === 'EM_DIA' && p.diasParaVencer !== null && p.diasParaVencer < 7) {
    return STATUS_COLORS.PROXIMO ?? '#F59E0B';
  }
  return STATUS_COLORS[p.status] ?? '#9e9e9e';
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function CircleTooltip({ p }: { p: PreventivaQuadroItem }) {
  return (
    <Box sx={{ p: 0.5, minWidth: 160 }}>
      <Typography variant="subtitle2" fontWeight={700}>
        {p.codigo}
      </Typography>
      <Typography variant="caption" display="block">
        Status: {p.status === 'EM_DIA' ? 'Em dia' : p.status === 'ATRASADA' ? 'Atrasada' : 'Sem historico'}
      </Typography>
      {p.ultimaData && (
        <Typography variant="caption" display="block">
          Ultima: {formatDate(p.ultimaData)}
        </Typography>
      )}
      {p.proximaData && (
        <Typography variant="caption" display="block">
          Proxima: {formatDate(p.proximaData)}
        </Typography>
      )}
      {p.diasParaVencer !== null && (
        <Typography variant="caption" display="block" fontWeight={600}>
          {p.diasParaVencer > 0
            ? `${p.diasParaVencer} dias restantes`
            : `${Math.abs(p.diasParaVencer)} dias atrasado`}
        </Typography>
      )}
    </Box>
  );
}

export function PreventivVehicleCard({ veiculo }: PreventivVehicleCardProps) {
  const hasAtrasada = veiculo.preventivas.some((p) => p.status === 'ATRASADA');

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1.5,
        borderColor: hasAtrasada ? '#d32f2f' : 'divider',
        borderWidth: hasAtrasada ? 2 : 1,
        minWidth: 180,
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle2" fontWeight={700} fontFamily="monospace" noWrap>
            {veiculo.placa}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap display="block">
            {veiculo.marcaModelo}
          </Typography>
        </Box>
        {veiculo.tag && (
          <Chip label={veiculo.tag} size="small" variant="outlined" sx={{ ml: 0.5, height: 20 }} />
        )}
      </Stack>
      <Stack direction="row" spacing={1} justifyContent="center">
        {veiculo.preventivas.map((p, idx) => (
          <Tooltip
            key={`${p.codigo}-${idx}`}
            title={<CircleTooltip p={p} />}
            arrow
            placement="top"
            slotProps={{
              tooltip: {
                sx: { bgcolor: 'background.paper', color: 'text.primary', boxShadow: 3 },
              },
              arrow: { sx: { color: 'background.paper' } },
            }}
          >
            <Stack alignItems="center" spacing={0.25}>
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  bgcolor: getCircleColor(p),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <Typography variant="caption" sx={{ color: '#fff', fontWeight: 700, fontSize: 10 }}>
                  {p.codigo}
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ fontSize: 9, color: 'text.disabled' }}>
                {formatDate(p.ultimaData)}
              </Typography>
            </Stack>
          </Tooltip>
        ))}
      </Stack>
    </Paper>
  );
}
