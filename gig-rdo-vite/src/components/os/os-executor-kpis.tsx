import { useMemo } from 'react';
import { Stack, Typography, Box } from '@mui/material';
import {
  BuildCircle, AccessTime, DirectionsCar, Assignment, Speed,
} from '@mui/icons-material';
import type { OsColabServico } from '@/types/os-list-types';

interface OsExecutorKpisProps {
  servicos: OsColabServico[];
}

interface KpiItem {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  accent: string;
  bg: string;
}

const LIMITE_JORNADA_MIN = 720;

export function OsExecutorKpis({ servicos }: OsExecutorKpisProps) {
  const kpis = useMemo<KpiItem[]>(() => {
    const normais = servicos.filter((s) => (s.tempoGastoMin ?? 0) <= LIMITE_JORNADA_MIN);
    const anomalias = servicos.length - normais.length;
    const totalMin = normais.reduce((a, s) => a + (s.tempoGastoMin ?? 0), 0);
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;

    const osDistintas = new Set(servicos.map((s) => s.NUOS)).size;
    const veiculos = new Set(
      servicos.filter((s) => s.placa).map((s) => s.placa!.trim()),
    ).size;
    const finalizados = servicos.filter((s) => s.STATUS === 'F').length;
    const mediaMin = normais.length > 0 ? Math.round(totalMin / normais.length) : 0;

    return [
      {
        label: 'Servicos', value: String(servicos.length),
        sub: `${finalizados} finalizado${finalizados !== 1 ? 's' : ''}`,
        icon: <BuildCircle />, accent: '#1565c0', bg: 'rgba(21,101,192,0.06)',
      },
      {
        label: 'Tempo Total', value: `${h}h ${m}min`,
        sub: anomalias > 0
          ? `${anomalias} anomalia${anomalias > 1 ? 's' : ''} excl.` : undefined,
        icon: <AccessTime />, accent: '#2e7d32', bg: 'rgba(46,125,50,0.06)',
      },
      {
        label: 'Media/Servico', value: `${mediaMin} min`,
        sub: anomalias > 0 ? `${normais.length} validos` : undefined,
        icon: <Speed />, accent: '#e65100', bg: 'rgba(230,81,0,0.06)',
      },
      {
        label: 'OS Atendidas', value: String(osDistintas),
        icon: <Assignment />, accent: '#7b1fa2', bg: 'rgba(123,31,162,0.06)',
      },
      {
        label: 'Veiculos', value: String(veiculos),
        icon: <DirectionsCar />, accent: '#0277bd', bg: 'rgba(2,119,189,0.06)',
      },
    ];
  }, [servicos]);

  return (
    <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
      {kpis.map((k) => (
        <Box
          key={k.label}
          sx={{
            flex: '1 1 155px',
            maxWidth: 220,
            px: 2,
            py: 1.5,
            borderRadius: 3,
            bgcolor: k.bg,
            border: '1px solid',
            borderColor: 'divider',
            transition: 'all 0.2s ease',
            cursor: 'default',
            '&:hover': {
              borderColor: k.accent,
              boxShadow: `0 2px 12px ${k.accent}14`,
              transform: 'translateY(-1px)',
            },
          }}
        >
          <Stack spacing={0.5}>
            <Stack direction="row" alignItems="center" spacing={0.75}>
              <Box sx={{
                color: k.accent,
                opacity: 0.8,
                display: 'flex',
                '& svg': { fontSize: 18 },
              }}>
                {k.icon}
              </Box>
              <Typography
                variant="overline"
                sx={{ color: 'text.secondary', lineHeight: 1, letterSpacing: '0.06em' }}
              >
                {k.label}
              </Typography>
            </Stack>

            <Typography
              sx={{
                fontSize: '1.5rem',
                fontWeight: 800,
                lineHeight: 1.1,
                color: k.accent,
                letterSpacing: '-0.02em',
                pl: 0.25,
              }}
            >
              {k.value}
            </Typography>

            {k.sub && (
              <Typography
                variant="caption"
                sx={{
                  color: 'text.disabled',
                  fontSize: '0.66rem',
                  lineHeight: 1.2,
                  pl: 0.25,
                }}
              >
                {k.sub}
              </Typography>
            )}
          </Stack>
        </Box>
      ))}
    </Stack>
  );
}
