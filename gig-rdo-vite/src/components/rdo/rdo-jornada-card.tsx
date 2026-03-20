import {
  Paper, Typography, Box, Skeleton, Chip, Divider, LinearProgress, Stack,
} from '@mui/material';
import { fmtMin } from '@/utils/wrench-time-categories';
import type { RdoListItem } from '@/types/rdo-types';

interface RdoJornadaCardProps {
  metricas: RdoListItem | null | undefined;
  isLoading: boolean;
}

function Row({ label, value, bold, color, prefix, dot }: {
  label: string; value: string; bold?: boolean; color?: string; prefix?: string; dot?: string;
}) {
  return (
    <>
      <Typography variant="body2" color="text.secondary" sx={{ py: 0.3 }}>
        {dot && <Box component="span" sx={{
          display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
          bgcolor: dot, mr: 0.5, verticalAlign: 'middle',
        }} />}
        {prefix && <Typography component="span" variant="body2" color={color}
          sx={{ fontWeight: 600, mr: 0.5 }}>{prefix}</Typography>}
        {label}
      </Typography>
      <Typography variant="body2" sx={{
        py: 0.3, fontWeight: bold ? 700 : 400, textAlign: 'right', color,
      }}>
        {value}
      </Typography>
    </>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <Typography variant="caption" fontWeight={700} color="text.secondary"
      sx={{ gridColumn: '1 / -1', pt: 0.5, textTransform: 'uppercase', letterSpacing: 0.5 }}>
      {children}
    </Typography>
  );
}

const gridSx = {
  display: 'grid', gridTemplateColumns: 'auto 1fr',
  columnGap: 2, rowGap: 0.25, alignItems: 'baseline',
} as const;

export function RdoJornadaCard({ metricas, isLoading }: RdoJornadaCardProps) {
  if (isLoading) {
    return (
      <Paper sx={{ p: 2, height: '100%' }}>
        <Skeleton width={140} height={24} sx={{ mb: 1 }} />
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} width="100%" height={22} sx={{ mb: 0.5 }} />
        ))}
      </Paper>
    );
  }
  if (!metricas) return null;
  const m = metricas;
  const pct = m.produtividadePercent;
  const barColor = pct >= 95 ? '#16A34A' : pct >= 85 ? '#F59E0B' : pct >= 70 ? '#F97316' : '#EF4444';
  const j = m.jornada;
  const cats = m.wtCategorias ?? [];
  const df = m.diagnosticoFaixa;

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
        <Typography variant="subtitle1" fontWeight="bold">Jornada & Produtividade</Typography>
        {df && (
          <Chip
            label={df.texto}
            size="small"
            variant="filled"
            sx={{ bgcolor: df.faixa.color, color: '#fff', fontWeight: 600 }}
          />
        )}
      </Stack>

      <Box sx={gridSx}>
        <SectionLabel>Tempo</SectionLabel>
        <Row label="Total bruto" value={fmtMin(m.totalBrutoMin)} />
        {m.almocoMin > 0 && (
          <Row prefix="(-)" label="Almoco" color="#F97316"
            value={m.almocoDescontadoMin !== m.almocoMin
              ? `${fmtMin(m.almocoMin)} (desc: ${fmtMin(m.almocoDescontadoMin)})`
              : fmtMin(m.almocoMin)} />
        )}
        <Row label="= Tempo no trabalho" value={j?.horasRealizadas ?? fmtMin(m.tempoNoTrabalho)}
          bold color="#3B82F6" />
        <Row label="Prevista (escala)" value={j?.horasPrevistas ?? fmtMin(m.minutosPrevistosDia)} />
        {(j ? j.saldo !== 0 : m.saldoJornadaMin !== 0) && (
          <Row label={(j?.saldoPositivo ?? m.saldoJornadaMin > 0) ? 'Hora extra' : 'Deficit'}
            value={j ? `${j.saldoPositivo ? '+' : '-'}${j.saldoFormatado}`
              : `${m.saldoJornadaMin > 0 ? '+' : ''}${fmtMin(m.saldoJornadaMin)}`}
            color={(j?.saldoPositivo ?? m.saldoJornadaMin > 0) ? '#F59E0B' : '#EF4444'} />
        )}
      </Box>
      <Divider sx={{ my: 1 }} />

      <Box sx={gridSx}>
        <SectionLabel>Composicao por categoria</SectionLabel>
        {cats.map((c) => (
          <Row key={c.categoria} label={c.label} value={fmtMin(c.minutos)} color={c.color} dot={c.color} />
        ))}
        {m.almocoMin > 0 && <Row label="Almoco" value={fmtMin(m.almocoMin)} color="#F97316" dot="#F97316" />}
        {m.minutosFumarPenalidade > 0 && (
          <Row prefix="(-)" label="Penalidade fumar" color="#EF4444"
            value={fmtMin(m.minutosFumarPenalidade)} />
        )}
      </Box>
      <Divider sx={{ my: 1 }} />

      <SectionLabel>Produtividade</SectionLabel>
      <Stack direction="row" alignItems="baseline" spacing={1} sx={{ mt: 0.5 }}>
        <Typography variant="h5" fontWeight={700} color={barColor}>{pct}%</Typography>
        <Typography variant="caption" color="text.secondary">
          {fmtMin(m.minutosProdu)} / {fmtMin(m.tempoNoTrabalho)}
        </Typography>
      </Stack>
      <LinearProgress variant="determinate" value={Math.min(pct, 100)} sx={{
        mt: 0.5, height: 8, borderRadius: 4, bgcolor: 'grey.200',
        '& .MuiLinearProgress-bar': { bgcolor: barColor, borderRadius: 4 },
      }} />
    </Paper>
  );
}
