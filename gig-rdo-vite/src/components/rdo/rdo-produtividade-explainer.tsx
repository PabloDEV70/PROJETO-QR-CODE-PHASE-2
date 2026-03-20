import {
  Box, Chip, Divider, LinearProgress, Paper, Stack, Typography,
} from '@mui/material';
import {
  AccessTime, Calculate, LocalDining, SmokingRooms, EmojiEvents, Wc,
} from '@mui/icons-material';
import type { RdoListItem } from '@/types/rdo-types';

interface Props { metricas: RdoListItem }

function fmt(min: number): string {
  if (min === 0) return '0min';
  const h = Math.floor(Math.abs(min) / 60);
  const m = Math.abs(min) % 60;
  const s = min < 0 ? '-' : '';
  return h > 0 ? `${s}${h}h${m > 0 ? `${String(m).padStart(2, '0')}min` : ''}` : `${s}${m}min`;
}

function R({ icon, label, value, color, bold, indent }: {
  icon?: React.ReactNode; label: string; value: string;
  color?: string; bold?: boolean; indent?: boolean;
}) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center"
      sx={indent ? { pl: 3 } : undefined}>
      <Stack direction="row" spacing={0.5} alignItems="center">
        {icon}
        <Typography variant="caption" color="text.secondary">{label}</Typography>
      </Stack>
      <Typography variant="caption" fontWeight={bold ? 700 : 400} color={color}>{value}</Typography>
    </Stack>
  );
}

function SH({ step, title }: { step: number; title: string }) {
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Chip label={step} size="small" sx={{
        width: 24, height: 24, fontSize: 12, fontWeight: 700, bgcolor: '#3B82F6', color: '#fff',
      }} />
      <Typography variant="body2" fontWeight={700}>{title}</Typography>
    </Stack>
  );
}

function Interp({ metricas: m, diff, heMin, previstoMin, produMin }: {
  metricas: RdoListItem; diff: string; heMin: number; previstoMin: number; produMin: number;
}) {
  const pct = m.produtividadePercent;
  const faixaColor = m.diagnosticoFaixa?.faixa.color;
  const diagnosticoTexto = m.diagnostico;

  const heNote = heMin > 0 && (
    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
      {produMin > previstoMin
        ? `Fez ${fmt(heMin)} HE, produziu ${fmt(produMin - previstoMin)} alem da jornada de ${fmt(previstoMin)}.`
        : `Fez ${fmt(heMin)} de hora extra (jornada: ${fmt(previstoMin)}).`}
    </Typography>
  );

  // Use API faixa color when available; fall back to hardcoded thresholds for old cached responses
  const bg = faixaColor ? `${faixaColor}08` : (pct >= 95 ? '#16A34A08' : pct >= 85 ? '#F59E0B08' : pct >= 70 ? '#F9731608' : '#EF444408');
  const bd = faixaColor ? `${faixaColor}20` : (pct >= 95 ? '#16A34A20' : pct >= 85 ? '#F59E0B20' : pct >= 70 ? '#F9731620' : '#EF444420');

  // Use API diagnostico text when available; fall back to hardcoded text for old cached responses
  let body: React.ReactNode;
  if (diagnosticoTexto && faixaColor) {
    body = pct >= 95
      ? <Stack direction="row" spacing={0.5} alignItems="flex-start">
          <EmojiEvents sx={{ fontSize: 16, color: faixaColor, mt: 0.25 }} />
          <Typography variant="caption"><b>{diagnosticoTexto}</b>{pct < 100 ? ` Faltaram ${diff} para 100%.` : ''}</Typography>
        </Stack>
      : <Typography variant="caption"><b>{diagnosticoTexto}</b>{pct < 95 ? ` Faltaram ${diff}.` : ''}</Typography>;
  } else {
    // Fallback for old cached responses without diagnosticoFaixa
    body = pct >= 95
      ? <Stack direction="row" spacing={0.5} alignItems="flex-start">
          <EmojiEvents sx={{ fontSize: 16, color: '#16A34A', mt: 0.25 }} />
          <Typography variant="caption"><b>Na meta!</b> {pct === 100
            ? 'Todo tempo produtivo.' : `Faltaram ${diff} para 100%.`}</Typography>
        </Stack>
      : pct >= 85 ? <Typography variant="caption"><b>Quase la.</b> Faltaram <b>{diff}</b>.</Typography>
        : pct >= 70 ? <Typography variant="caption"><b>{pct}%.</b> <b>{diff}</b> improdutivos.</Typography>
          : <Typography variant="caption"><b>Critico — {pct}%.</b> <b>{diff}</b> improd.</Typography>;
  }

  return <Box sx={{ p: 1, borderRadius: 1, bgcolor: bg, border: `1px solid ${bd}` }}>{body}{heNote}</Box>;
}

export function RdoProdutividadeExplainer({ metricas: m }: Props) {
  const pct = m.produtividadePercent;
  const tnt = m.tempoNoTrabalho;
  const barColor = m.diagnosticoFaixa?.faixa.color
    ?? (pct >= 95 ? '#16A34A' : pct >= 85 ? '#F59E0B' : pct >= 70 ? '#F97316' : '#EF4444');
  const pe = Math.max(m.minutosProdu, 0);
  const diff = fmt(Math.abs(tnt - pe));
  const cats = m.wtCategorias ?? [];

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Stack spacing={1.5}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={1} alignItems="center">
            <Calculate sx={{ fontSize: 20, color: '#3B82F6' }} />
            <Typography variant="subtitle1" fontWeight={700}>Como chegamos em {pct}%?</Typography>
          </Stack>
          <Chip label={`${pct}%`} size="small" sx={{
            fontWeight: 700, fontSize: 16, height: 28, bgcolor: `${barColor}20`, color: barColor,
          }} />
        </Stack>
        <LinearProgress variant="determinate" value={Math.min(pct, 100)} sx={{
          height: 12, borderRadius: 6, bgcolor: 'grey.200',
          '& .MuiLinearProgress-bar': { bgcolor: barColor, borderRadius: 6 },
        }} />
        <Divider />
        <SH step={1} title="Tempo registrado por categoria" />
        <R icon={<AccessTime sx={{ fontSize: 14 }} />} label="Total bruto" value={fmt(m.totalBrutoMin)} bold />
        {cats.map((c) => (
          <R key={c.categoria} icon={<Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: c.color }} />}
            label={c.label} value={fmt(c.minutos)} color={c.color} indent />
        ))}
        {m.almocoMin > 0 && <R icon={<LocalDining sx={{ fontSize: 14, color: '#F97316' }} />}
          label="Almoco" value={fmt(m.almocoMin)} color="#F97316" indent />}
        <Divider />
        <SH step={2} title="Tempo no trabalho" />
        <R label="Total bruto" value={fmt(m.totalBrutoMin)} />
        {m.almocoMin > 0 && <R icon={<LocalDining sx={{ fontSize: 14, color: '#F97316' }} />}
          label={m.almocoDescontadoMin < m.almocoMin
            ? `Almoco (${fmt(m.almocoMin)} reg, intervalo ${fmt(m.intervaloAlmocoMin)})`
            : 'Almoco descontado'}
          value={`-${fmt(m.almocoDescontadoMin)}`} color="#F97316" />}
        {m.banheiroMin > 0 && <R icon={<Wc sx={{ fontSize: 14, color: '#8B5CF6' }} />}
          label={`Banheiro (${fmt(m.banheiroMin)} reg, tol ${fmt(m.banheiroDescontadoMin)})`}
          value={m.banheiroMin > m.banheiroDescontadoMin
            ? `${fmt(m.banheiroMin - m.banheiroDescontadoMin)} excesso` : 'na tolerancia'}
          color="#8B5CF6" />}
        <Box sx={{ p: 1, borderRadius: 1, bgcolor: '#3B82F608', border: '1px solid #3B82F620' }}>
          <Typography variant="caption">
            Tempo no trabalho = <b>{fmt(m.totalBrutoMin)}</b> - <b>{fmt(m.almocoDescontadoMin)}</b> = <b>{fmt(tnt)}</b>
          </Typography>
        </Box>
        <Divider />
        <SH step={3} title="Produtivo efetivo" />
        <R label="Atividades produtivas" value={fmt(m.minutosProdu)} bold color="#16A34A" />
        {m.minutosFumarPenalidade > 0 && <>
          <R icon={<SmokingRooms sx={{ fontSize: 14, color: '#EF4444' }} />}
            label={`Penalidade fumar (${m.fumarQtd}x)`} value={`-${fmt(m.minutosFumarPenalidade)}`} color="#EF4444" />
          <R label="Produtivo efetivo" value={fmt(pe)} bold color="#16A34A" />
        </>}
        <Divider />
        <SH step={4} title="Calculo final" />
        <Box sx={{ p: 1.5, borderRadius: 1, bgcolor: '#10B98108', border: '1px solid #10B98120' }}>
          <Typography variant="body2" fontWeight={700} textAlign="center">
            {fmt(pe)} / {fmt(tnt)} x 100 = {pct}%
          </Typography>
          <Typography variant="caption" color="text.secondary" textAlign="center" display="block">
            produtivo efetivo / tempo no trabalho
          </Typography>
        </Box>
        <Interp metricas={m} diff={diff} heMin={m.horaExtraMin} previstoMin={m.minutosPrevistosDia} produMin={pe} />
      </Stack>
    </Paper>
  );
}
