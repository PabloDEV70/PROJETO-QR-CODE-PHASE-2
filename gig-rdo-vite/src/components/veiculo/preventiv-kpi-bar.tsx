import { Box, Chip, LinearProgress, Stack, Typography } from '@mui/material';
import {
  DirectionsCar,
  CheckCircle,
  Error as ErrorIcon,
  HelpOutline,
} from '@mui/icons-material';
import type { QuadroResumoGeral } from '@/types/preventiva-types';

interface PreventivKpiBarProps {
  resumo: QuadroResumoGeral;
}

export function PreventivKpiBar({ resumo }: PreventivKpiBarProps) {
  const { totalVeiculos, emDia, atrasados, semHistorico } = resumo;
  const pctEmDia = totalVeiculos > 0 ? Math.round((emDia / totalVeiculos) * 100) : 0;

  const kpis = [
    {
      label: 'Total Veiculos',
      value: totalVeiculos,
      icon: <DirectionsCar sx={{ fontSize: 18 }} />,
      color: 'primary.main' as const,
      bgColor: 'primary.50' as const,
    },
    {
      label: 'Em Dia',
      value: emDia,
      icon: <CheckCircle sx={{ fontSize: 18 }} />,
      color: '#16A34A',
      bgColor: '#F0FDF4',
    },
    {
      label: 'Atrasados',
      value: atrasados,
      icon: <ErrorIcon sx={{ fontSize: 18 }} />,
      color: '#d32f2f',
      bgColor: '#FEF2F2',
    },
    {
      label: 'Sem Historico',
      value: semHistorico,
      icon: <HelpOutline sx={{ fontSize: 18 }} />,
      color: '#9e9e9e',
      bgColor: '#F5F5F5',
    },
  ];

  return (
    <Stack spacing={1.5}>
      <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
        {kpis.map((kpi) => (
          <Chip
            key={kpi.label}
            icon={kpi.icon}
            label={
              <Stack direction="row" spacing={0.5} alignItems="baseline">
                <Typography variant="subtitle2" fontWeight={700} sx={{ color: kpi.color }}>
                  {kpi.value}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {kpi.label}
                </Typography>
              </Stack>
            }
            variant="outlined"
            sx={{
              height: 36,
              borderColor: kpi.color,
              bgcolor: kpi.bgColor,
              '& .MuiChip-icon': { color: kpi.color },
            }}
          />
        ))}
      </Stack>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <LinearProgress
          variant="determinate"
          value={pctEmDia}
          sx={{
            flex: 1,
            height: 8,
            borderRadius: 4,
            bgcolor: '#FECACA',
            '& .MuiLinearProgress-bar': { bgcolor: '#16A34A', borderRadius: 4 },
          }}
        />
        <Typography variant="caption" fontWeight={600} color="text.secondary">
          {pctEmDia}% em dia
        </Typography>
      </Box>
    </Stack>
  );
}
