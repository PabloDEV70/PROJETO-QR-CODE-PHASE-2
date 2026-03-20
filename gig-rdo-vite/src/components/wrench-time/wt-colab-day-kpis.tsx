import { Grid, LinearProgress, Paper, Stack, Typography } from '@mui/material';
import {
  AccessTime, Speed, TrendingUp, MoreTime,
  Restaurant, Balance, Block, EmojiEvents,
} from '@mui/icons-material';
import { fmtMin, getBenchmarkColor } from '@/utils/wrench-time-categories';
import type { ColaboradorTimelineDia } from '@/types/rdo-types';

interface WtColabDayKpisProps {
  dia: ColaboradorTimelineDia;
}

function KpiCard({ label, value, sub, color, icon, accent, progress }: {
  label: string; value: string; sub?: string; color?: string;
  icon?: React.ReactNode; accent?: string; progress?: number;
}) {
  return (
    <Paper sx={{
      p: 2, borderRadius: 2, height: '100%',
      borderTop: accent ? `3px solid ${accent}` : undefined,
    }}>
      <Stack spacing={0.75}>
        <Stack direction="row" alignItems="center" spacing={0.5}>
          {icon}
          <Typography variant="overline" color="text.secondary"
            sx={{ fontSize: '0.65rem', lineHeight: 1.2 }}>
            {label}
          </Typography>
        </Stack>
        <Typography fontWeight={700} sx={{
          fontSize: { xs: '1.1rem', sm: '1.25rem' }, color: color ?? 'text.primary',
        }}>
          {value}
        </Typography>
        {progress !== undefined && (
          <LinearProgress variant="determinate" value={Math.min(progress, 100)}
            sx={{
              height: 4, borderRadius: 2, bgcolor: 'grey.200',
              '& .MuiLinearProgress-bar': { bgcolor: color ?? 'primary.main', borderRadius: 2 },
            }}
          />
        )}
        {sub && (
          <Typography variant="caption" color="text.secondary">{sub}</Typography>
        )}
      </Stack>
    </Paper>
  );
}

export function WtColabDayKpis({ dia }: WtColabDayKpisProps) {
  const { resumo: r, meta: m } = dia;
  const benchColor = getBenchmarkColor(
    r.percentProdutivo >= 50 ? 'above' : r.percentProdutivo >= 35 ? 'target' : 'below',
  );
  const metaColor = m.atingiuMeta ? '#16A34A' : '#EF4444';
  const saldoSign = m.saldoMin > 0 ? '+' : '';

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 6, sm: 4, md: 3 }}>
        <KpiCard label="Trabalhado" value={fmtMin(r.totalMinutos)}
          sub={`Jornada: ${fmtMin(m.cargaHorariaPrevistaMin)}`} accent="#3B82F6"
          icon={<AccessTime fontSize="small" sx={{ color: '#3B82F6' }} />} />
      </Grid>
      <Grid size={{ xs: 6, sm: 4, md: 3 }}>
        <KpiCard label="Produtivo" value={`${r.percentProdutivo}%`}
          sub={fmtMin(r.minutosProdu)} color={benchColor} accent={benchColor}
          progress={r.percentProdutivo}
          icon={<Speed fontSize="small" sx={{ color: benchColor }} />} />
      </Grid>
      <Grid size={{ xs: 6, sm: 4, md: 3 }}>
        <KpiCard label="Meta" value={`${m.percentMeta}%`}
          sub={m.atingiuMeta ? 'Atingiu' : `Faltam ${fmtMin(Math.abs(m.saldoMin))}`}
          color={metaColor} accent={metaColor} progress={m.percentMeta}
          icon={m.percentMeta >= 100
            ? <EmojiEvents fontSize="small" sx={{ color: '#F59E0B' }} />
            : <TrendingUp fontSize="small" sx={{ color: metaColor }} />} />
      </Grid>
      <Grid size={{ xs: 6, sm: 4, md: 3 }}>
        <KpiCard label="Aproveitamento" value={`${m.aproveitamentoPercent}%`}
          sub={`Desempenho: ${m.desempenhoPercent}%`} accent="#8B5CF6"
          progress={m.aproveitamentoPercent}
          icon={<TrendingUp fontSize="small" sx={{ color: '#8B5CF6' }} />} />
      </Grid>
      <Grid size={{ xs: 6, sm: 4, md: 3 }}>
        <KpiCard label="Hora Extra"
          value={m.horaExtraMin > 0 ? `+${fmtMin(m.horaExtraMin)}` : '—'}
          color={m.horaExtraMin > 0 ? '#1D4ED8' : undefined}
          accent={m.horaExtraMin > 0 ? '#1D4ED8' : '#E2E8F0'}
          icon={<MoreTime fontSize="small"
            color={m.horaExtraMin > 0 ? 'primary' : 'disabled'} />} />
      </Grid>
      <Grid size={{ xs: 6, sm: 4, md: 3 }}>
        <KpiCard label="Almoco" value={fmtMin(m.almocoRealMin)}
          sub={m.almocoExcessoMin > 0
            ? `Excesso: ${fmtMin(m.almocoExcessoMin)}`
            : 'Dentro do previsto'}
          accent={m.almocoExcessoMin > 0 ? '#F59E0B' : '#E2E8F0'}
          icon={<Restaurant fontSize="small"
            sx={{ color: m.almocoExcessoMin > 0 ? '#F59E0B' : '#94A3B8' }} />} />
      </Grid>
      <Grid size={{ xs: 6, sm: 4, md: 3 }}>
        <KpiCard label="Saldo" value={`${saldoSign}${fmtMin(m.saldoMin)}`}
          sub={m.saldoMin >= 0 ? 'Positivo' : 'Negativo'}
          color={m.saldoMin >= 0 ? '#16A34A' : '#EF4444'}
          accent={m.saldoMin >= 0 ? '#16A34A' : '#EF4444'}
          icon={<Balance fontSize="small"
            color={m.saldoMin >= 0 ? 'success' : 'error'} />} />
      </Grid>
      <Grid size={{ xs: 6, sm: 4, md: 3 }}>
        <KpiCard label="Gap N-Prod" value={fmtMin(m.gapNaoProdutivoMin)}
          sub="Tempo nao produtivo" color="#64748B" accent="#94A3B8"
          icon={<Block fontSize="small" color="disabled" />} />
      </Grid>
    </Grid>
  );
}
