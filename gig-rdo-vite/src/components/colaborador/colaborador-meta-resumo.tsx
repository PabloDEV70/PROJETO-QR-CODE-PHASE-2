import {
  Box, Paper, Typography, Stack, LinearProgress, Divider, Chip,
} from '@mui/material';
import {
  AccessTime, TrendingUp, TrendingDown, Timer, CheckCircle, Warning,
} from '@mui/icons-material';
import type { ColaboradorTimelineResponse } from '@/types/rdo-timeline-types';
import { formatMinutos, formatMinutosSigned } from '@/utils/gantt-utils';

interface ColaboradorMetaResumoProps {
  cargaHoraria: ColaboradorTimelineResponse['cargaHoraria'];
  resumoPeriodo: ColaboradorTimelineResponse['resumoPeriodo'];
  totalDias: number;
}

export function ColaboradorMetaResumo({
  cargaHoraria,
  resumoPeriodo,
  totalDias,
}: ColaboradorMetaResumoProps) {
  if (!cargaHoraria) return null;

  const metaProd = resumoPeriodo.totalMetaProdutivaMin || 0;
  const percentAtingido = metaProd > 0
    ? Math.round((resumoPeriodo.totalMinutosProdutivos / metaProd) * 100)
    : 0;
  const temDeficit = resumoPeriodo.totalSaldoMin < 0;

  return (
    <Paper sx={{ p: 2.5 }}>
      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
        Resumo de Meta do Periodo
      </Typography>

      {/* Progress bar section */}
      <Box sx={{ mb: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
          <Typography variant="body2" color="text.secondary">
            Progresso da Meta ({totalDias} dias)
          </Typography>
          <Typography variant="body2" fontWeight={600}>
            {percentAtingido}%
          </Typography>
        </Stack>
        <LinearProgress
          variant="determinate"
          value={Math.min(percentAtingido, 100)}
          sx={{
            height: 10,
            borderRadius: 5,
            bgcolor: 'grey.200',
            '& .MuiLinearProgress-bar': {
              borderRadius: 5,
              bgcolor: percentAtingido >= 100 ? 'success.main' : 'warning.main',
            },
          }}
        />
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* 4 metrics */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        divider={<Divider orientation="vertical" flexItem />}
        sx={{ mb: 2 }}
      >
        <MetricItem
          icon={<Timer sx={{ color: 'info.main' }} />}
          label="Meta Produtiva"
          value={formatMinutos(metaProd)}
          subtext={`${cargaHoraria.inicio} - ${cargaHoraria.fim}`}
        />
        <MetricItem
          icon={<TrendingUp sx={{ color: 'success.main' }} />}
          label="Horas Produtivas"
          value={formatMinutos(resumoPeriodo.totalMinutosProdutivos)}
          valueColor="success.main"
        />
        <MetricItem
          icon={<AccessTime sx={{ color: 'warning.main' }} />}
          label="Gap Nao Produtivo"
          value={formatMinutos(resumoPeriodo.totalGapNaoProdutivoMin)}
          valueColor="warning.main"
        />
        <MetricItem
          icon={temDeficit
            ? <TrendingDown sx={{ color: 'error.main' }} />
            : <CheckCircle sx={{ color: 'success.main' }} />}
          label="Saldo"
          value={formatMinutosSigned(resumoPeriodo.totalSaldoMin)}
          chip={temDeficit
            ? <Chip label="FALTA" size="small" color="error" variant="outlined" />
            : <Chip label="OK" size="small" color="success" variant="outlined" />}
        />
      </Stack>

      <Divider sx={{ mb: 2 }} />

      {/* Summary chips */}
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        <Chip
          icon={<CheckCircle />}
          label={`${resumoPeriodo.diasAtingiuMetaProdutiva} dias atingiram meta produtiva`}
          color="success"
          variant="outlined"
          size="small"
        />
        <Chip
          icon={<Warning />}
          label={`${resumoPeriodo.diasNaoAtingiuMeta} dias abaixo da meta`}
          color="warning"
          variant="outlined"
          size="small"
        />
        {resumoPeriodo.totalHoraExtraMin > 0 && (
          <Chip
            label={`${formatMinutos(resumoPeriodo.totalHoraExtraMin)} de hora extra no periodo`}
            color="warning"
            variant="filled"
            size="small"
          />
        )}
      </Stack>
    </Paper>
  );
}

interface MetricItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext?: string;
  valueColor?: string;
  chip?: React.ReactNode;
}

function MetricItem({ icon, label, value, subtext, valueColor, chip }: MetricItemProps) {
  return (
    <Stack direction="row" spacing={1} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
      {icon}
      <Box>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
        <Stack direction="row" spacing={0.5} alignItems="center">
          <Typography
            variant="h6"
            fontWeight={700}
            sx={{ color: valueColor ?? 'text.primary' }}
          >
            {value}
          </Typography>
          {chip}
        </Stack>
        {subtext && (
          <Typography variant="caption" color="text.secondary">
            {subtext}
          </Typography>
        )}
      </Box>
    </Stack>
  );
}
