import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import LinearProgress from '@mui/material/LinearProgress';
import type { RdoMetricas } from '@/types/rdo-types';
import { MetricRow, SectionLabel } from '@/components/shared/metric-row';
import { prodColor } from '@/utils/produtividade-utils';
import { formatMinutos as fmtMin } from '@/utils/hora-utils';

interface Props {
  m: RdoMetricas;
}

export function RdoJornadaCard({ m }: Props) {
  const pct = m.produtividadePercent;
  const barC = m.diagnosticoFaixa?.faixa.color ?? prodColor(pct);
  const j = m.jornada;
  const cats = m.wtCategorias ?? [];

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
        Jornada & Produtividade
      </Typography>

      {/* Tempo */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'auto 1fr', columnGap: 2, rowGap: 0.25, alignItems: 'baseline' }}>
        <SectionLabel>Tempo</SectionLabel>
        <MetricRow label="Total bruto" value={fmtMin(m.totalBrutoMin)} bold />
        {m.almocoMin > 0 && (
          <MetricRow
            label="Almoco"
            value={m.almocoDescontadoMin !== m.almocoMin
              ? `${fmtMin(m.almocoMin)} (desc: ${fmtMin(m.almocoDescontadoMin)})`
              : fmtMin(m.almocoMin)}
            color="#F97316"
            prefix="(-)"
          />
        )}
        <MetricRow label="= Tempo no trabalho" value={j?.horasRealizadas ?? fmtMin(m.tempoNoTrabalho)} bold color="#3B82F6" />
        <MetricRow label="Prevista (escala)" value={j?.horasPrevistas ?? fmtMin(m.minutosPrevistosDia)} />
        {j && j.saldo !== 0 && (
          <MetricRow
            label={j.saldoPositivo ? 'Hora extra' : 'Deficit'}
            value={`${j.saldoPositivo ? '+' : '-'}${j.saldoFormatado}`}
            color={j.saldoPositivo ? '#F59E0B' : '#EF4444'}
          />
        )}
      </Box>

      <Divider sx={{ my: 1 }} />

      {/* Categorias wrenchTime */}
      {cats.length > 0 && (
        <>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'auto 1fr', columnGap: 2, rowGap: 0.25, alignItems: 'baseline' }}>
            <SectionLabel>Composicao por categoria</SectionLabel>
            {cats.map((c) => (
              <MetricRow key={c.categoria} label={c.label} value={`${fmtMin(c.minutos)} (${c.percent}%)`} color={c.color} dot={c.color} />
            ))}
            {m.almocoMin > 0 && <MetricRow label="Almoco" value={fmtMin(m.almocoMin)} color="#F97316" dot="#F97316" />}
            {m.minutosFumarPenalidade > 0 && (
              <MetricRow prefix="(-)" label="Penalidade fumar" color="#EF4444" value={fmtMin(m.minutosFumarPenalidade)} />
            )}
          </Box>
          <Divider sx={{ my: 1 }} />
        </>
      )}

      {/* Tolerancias */}
      {m.tolerancias && (m.tolerancias.banheiro.aplicada || m.tolerancias.fumar.aplicada) && (
        <>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'auto 1fr', columnGap: 2, rowGap: 0.25, alignItems: 'baseline' }}>
            <SectionLabel>Tolerancias</SectionLabel>
            {m.banheiroQtd > 0 && (
              <MetricRow
                label={`Banheiro (${m.banheiroQtd}x)`}
                value={`${fmtMin(m.banheiroMin)}${m.banheiroDescontadoMin > 0 ? ` desc: ${fmtMin(m.banheiroDescontadoMin)}` : ''}`}
                color="#F97316"
              />
            )}
            {m.fumarQtd > 0 && (
              <MetricRow
                label={`Fumar (${m.fumarQtd}x)`}
                value={`${fmtMin(m.fumarMinReal)} pen: ${fmtMin(m.minutosFumarPenalidade)}`}
                color="#EF4444"
              />
            )}
          </Box>
          <Divider sx={{ my: 1 }} />
        </>
      )}

      {/* Produtividade */}
      <SectionLabel>Produtividade</SectionLabel>
      <Stack direction="row" alignItems="baseline" spacing={1} sx={{ mt: 0.5 }}>
        <Typography variant="h4" fontWeight={700} color={barC} lineHeight={1}>
          {pct}%
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {fmtMin(m.minutosProdu)} / {fmtMin(m.tempoNoTrabalho)}
        </Typography>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={Math.min(pct, 100)}
        sx={{
          mt: 0.5, height: 8, borderRadius: 4, bgcolor: 'grey.200',
          '& .MuiLinearProgress-bar': { bgcolor: barC, borderRadius: 4 },
        }}
      />
    </Paper>
  );
}
