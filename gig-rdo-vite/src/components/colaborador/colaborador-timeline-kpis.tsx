import { Box, Paper, Typography, Stack, Grid, Skeleton } from '@mui/material';
import {
  AccessTime, TrendingUp, CheckCircle, Speed, Schedule, Warning,
} from '@mui/icons-material';
import type { ColaboradorTimelineResponse } from '@/types/rdo-timeline-types';
import { formatMinutos } from '@/utils/gantt-utils';

interface ColaboradorTimelineKpisProps {
  resumo?: ColaboradorTimelineResponse['resumoPeriodo'];
  totalDias: number;
  isLoading?: boolean;
}

function KpiCard({ icon, label, value, subvalue, color, bgColor, isLoading }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subvalue: string;
  color: string;
  bgColor: string;
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <Paper sx={{ p: 1.5, height: '100%' }}>
        <Stack spacing={1}>
          <Skeleton variant="circular" width={32} height={32} />
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="80%" />
          <Skeleton variant="text" width="50%" />
        </Stack>
      </Paper>
    );
  }

  return (
    <Paper
      sx={{
        p: 1.5,
        height: '100%',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': { transform: 'translateY(-2px)', boxShadow: 3 },
      }}
    >
      <Stack spacing={0.5}>
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: bgColor,
            color,
          }}
        >
          {icon}
        </Box>
        <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 700, color }}>
          {value}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.2 }}>
          {subvalue}
        </Typography>
        <Typography
          variant="caption"
          sx={{ fontWeight: 600, color: 'text.primary', lineHeight: 1.2 }}
        >
          {label}
        </Typography>
      </Stack>
    </Paper>
  );
}

function buildJornadaSubvalue(
  resumo: ColaboradorTimelineResponse['resumoPeriodo'],
): string {
  const parts: string[] = [];
  if ((resumo.totalAtrasoMin || 0) > 0) {
    parts.push(`${formatMinutos(resumo.totalAtrasoMin)} atraso`);
  }
  if ((resumo.totalSaidaAntecipadaMin || 0) > 0) {
    parts.push(`${formatMinutos(resumo.totalSaidaAntecipadaMin)} saida antecipada`);
  }
  return parts.length > 0 ? parts.join(', ') : 'Sem desvios';
}

export function ColaboradorTimelineKpis({
  resumo,
  totalDias,
  isLoading,
}: ColaboradorTimelineKpisProps) {
  if (!resumo && !isLoading) return null;

  const diasMetaProd = resumo?.diasAtingiuMetaProdutiva ?? 0;
  const percentMetaProd = totalDias > 0
    ? Math.round((diasMetaProd / totalDias) * 100)
    : 0;

  const kpis = resumo ? [
    {
      label: 'Horas Produtivas',
      value: formatMinutos(resumo.totalMinutosProdutivos),
      subvalue: `${resumo.desempenhoGeralPercent}% da meta`,
      color: '#2e7d32',
      bgColor: 'rgba(46, 125, 50, 0.08)',
      icon: <TrendingUp />,
    },
    {
      label: 'Aproveitamento',
      value: `${resumo.aproveitamentoGeralPercent}%`,
      subvalue: 'produtivo do disponivel',
      color: '#1976d2',
      bgColor: 'rgba(25, 118, 210, 0.08)',
      icon: <Speed />,
    },
    {
      label: 'Hora Extra',
      value: formatMinutos(resumo.totalHoraExtraMin || 0),
      subvalue: `${resumo.diasComHoraExtra || 0} dias`,
      color: '#ed6c02',
      bgColor: 'rgba(237, 108, 2, 0.08)',
      icon: <Warning />,
    },
    {
      label: 'Jornada',
      value: `${resumo.diasCumpriuJornada || 0}/${
        (resumo.diasCumpriuJornada || 0) + (resumo.diasNaoCumpriuJornada || 0)
      }`,
      subvalue: buildJornadaSubvalue(resumo),
      color: '#0288d1',
      bgColor: 'rgba(2, 136, 209, 0.08)',
      icon: <Schedule />,
    },
    {
      label: 'Dias com Meta',
      value: `${diasMetaProd}/${totalDias}`,
      subvalue: `${percentMetaProd}% atingiram`,
      color: percentMetaProd >= 50 ? '#2e7d32' : '#ed6c02',
      bgColor: percentMetaProd >= 50
        ? 'rgba(46, 125, 50, 0.08)'
        : 'rgba(237, 108, 2, 0.08)',
      icon: <CheckCircle />,
    },
    {
      label: 'Media Diaria Prod',
      value: formatMinutos(resumo.mediaDiariaProdMin || 0),
      subvalue: `${resumo.desempenhoGeralPercent}% da meta`,
      color: '#7b1fa2',
      bgColor: 'rgba(123, 31, 162, 0.08)',
      icon: <AccessTime />,
    },
  ] : Array.from({ length: 6 }, (_, i) => ({
    label: `kpi-${i}`,
    value: '',
    subvalue: '',
    color: '#ccc',
    bgColor: 'rgba(0,0,0,0.04)',
    icon: <AccessTime />,
  }));

  return (
    <Grid container spacing={2}>
      {kpis.map((kpi) => (
        <Grid key={kpi.label} size={{ xs: 4, sm: 4, md: 2 }}>
          <KpiCard {...kpi} isLoading={isLoading} />
        </Grid>
      ))}
    </Grid>
  );
}
