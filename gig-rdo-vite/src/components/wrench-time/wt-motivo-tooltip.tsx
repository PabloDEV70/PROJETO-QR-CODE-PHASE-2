import { Box, Chip, Stack, Tooltip, Typography } from '@mui/material';
import { Info } from '@mui/icons-material';
import { fmtMin } from '@/utils/wrench-time-categories';
import type { WrenchTimeBreakdown, WtDeductions } from '@/types/wrench-time-types';

const MOTIVO_ALMOCO = 3;
const MOTIVO_BANHEIRO = 2;

function MotivoTooltipContent({ cod, d }: { cod: number; d: WtDeductions }) {
  if (cod === MOTIVO_ALMOCO) {
    return (
      <Box sx={{ p: 0.5 }}>
        <Typography variant="caption" fontWeight={700}>Almoco (so excesso)</Typography>
        <Typography variant="caption" display="block">Real: {fmtMin(d.almocoTotalMin)}</Typography>
        <Typography variant="caption" display="block">
          Programado: {fmtMin(d.almocoProgramadoMin)}
        </Typography>
        <Typography variant="caption" display="block" fontWeight={700} color="#EF4444">
          Excesso: {fmtMin(d.almocoExcessoMin)}
        </Typography>
        <Typography variant="caption" display="block" sx={{ mt: 0.5, opacity: 0.8 }}>
          Os {fmtMin(d.almocoProgramadoMin)} programados foram descontados da base efetiva.
        </Typography>
      </Box>
    );
  }
  if (cod === MOTIVO_BANHEIRO) {
    return (
      <Box sx={{ p: 0.5 }}>
        <Typography variant="caption" fontWeight={700}>Banheiro (so excesso)</Typography>
        <Typography variant="caption" display="block">Real: {fmtMin(d.banheiroTotalMin)}</Typography>
        <Typography variant="caption" display="block">
          Tolerancia: {fmtMin(d.banheiroToleranciaMin)} ({d.totalRdos} RDOs x 10min)
        </Typography>
        <Typography variant="caption" display="block" fontWeight={700} color="#EF4444">
          Excesso: {fmtMin(d.banheiroExcessoMin)}
        </Typography>
        <Typography variant="caption" display="block" sx={{ mt: 0.5, opacity: 0.8 }}>
          Os {fmtMin(d.banheiroToleranciaMin)} tolerados foram descontados da base efetiva.
        </Typography>
      </Box>
    );
  }
  return null;
}

export function ExpandedMotivos({ cat, d }: { cat: WrenchTimeBreakdown; d: WtDeductions }) {
  return (
    <Box sx={{ p: 2, bgcolor: 'action.hover' }}>
      {cat.motivos.map((m) => {
        const isSpecial = m.cod === MOTIVO_ALMOCO || m.cod === MOTIVO_BANHEIRO;
        const tip = isSpecial ? <MotivoTooltipContent cod={m.cod} d={d} /> : null;
        return (
          <Stack key={m.cod} direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="caption" fontWeight={600} sx={{ minWidth: 50 }}>
              {m.sigla}
            </Typography>
            <Typography variant="caption" sx={{ flex: 1 }}>
              {m.descricao}
              {isSpecial && (
                <Chip label="so excesso" size="small" sx={{
                  ml: 0.5, height: 16, fontSize: 9, bgcolor: '#F59E0B20', color: '#F59E0B',
                }} />
              )}
            </Typography>
            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ minWidth: 80 }}>
              <Typography variant="caption" fontWeight={600}>{fmtMin(m.totalMin)}</Typography>
              {tip && (
                <Tooltip title={tip} arrow placement="top">
                  <Info sx={{ fontSize: 14, color: 'text.secondary', cursor: 'help' }} />
                </Tooltip>
              )}
            </Stack>
            <Typography variant="caption" color="text.secondary" sx={{ minWidth: 30 }}>
              {m.percentOfCategory}%
            </Typography>
            <Box sx={{ width: 80, height: 6, borderRadius: 3, bgcolor: 'grey.200' }}>
              <Box sx={{
                width: `${m.percentOfCategory}%`, height: '100%',
                borderRadius: 3, bgcolor: cat.color,
              }} />
            </Box>
          </Stack>
        );
      })}
    </Box>
  );
}
