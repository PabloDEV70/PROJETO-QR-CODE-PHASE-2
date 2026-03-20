import { Box, Chip, Paper, Skeleton, Stack, Tooltip, Typography, useMediaQuery, useTheme } from '@mui/material';
import { AccessTime, MoreTime, People, Speed, TrendingDown } from '@mui/icons-material';
import { fmtMin } from '@/utils/wrench-time-categories';

interface WtKpiRowProps {
  wrenchTimePercent: number | null;
  totalProdMin: number;
  totalLossMin: number;
  topLossCategory: string | null;
  topLossMin: number;
  totalColaboradores: number | null;
  benchmarkStatus: 'below' | 'target' | 'above' | null;
  overtimeMin?: number;
  overtimeProdMin?: number;
  overtimeNonProdMin?: number;
  isLoading?: boolean;
}

function getBenchmarkColor(status: 'below' | 'target' | 'above'): string {
  if (status === 'above') return '#16A34A';
  if (status === 'target') return '#F59E0B';
  return '#EF4444';
}

const benchmarkLabel = (s: 'below' | 'target' | 'above') =>
  s === 'above' ? 'Excelente' : s === 'target' ? 'Na Faixa' : 'Critico';

export function WtKpiRow({
  wrenchTimePercent, totalProdMin, totalLossMin,
  topLossCategory, topLossMin, totalColaboradores,
  benchmarkStatus, overtimeMin, overtimeProdMin, overtimeNonProdMin,
  isLoading,
}: WtKpiRowProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const hasOvertime = (overtimeMin ?? 0) > 0;

  if (isLoading) {
    return (
      <Stack spacing={0.75}>
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} variant="rounded" height={isMobile ? 44 : 72} sx={{ borderRadius: 2 }} />
        ))}
      </Stack>
    );
  }

  const wtColor = benchmarkStatus ? getBenchmarkColor(benchmarkStatus) : '#64748B';
  const totalMin = totalProdMin + totalLossMin;

  const cards = [
    {
      key: 'wt', label: 'Wrench Time', icon: <Speed sx={{ fontSize: 18 }} />,
      color: wtColor, bg: `${wtColor}15`,
      value: wrenchTimePercent != null ? `${wrenchTimePercent}%` : '-',
      sub: benchmarkStatus ? benchmarkLabel(benchmarkStatus) : undefined,
      subColor: wtColor, accent: false,
      tooltip: `WT = Produtivo / Base efetiva\nProdutivo: ${fmtMin(totalProdMin)}\nBase: ${fmtMin(totalMin)}`,
    },
    {
      key: 'prod', label: 'Produtivo', icon: <AccessTime sx={{ fontSize: 18 }} />,
      color: '#16A34A', bg: 'rgba(22,163,74,0.08)',
      value: fmtMin(totalProdMin),
      sub: totalMin > 0 ? `de ${fmtMin(totalMin)}` : undefined,
      subColor: '#16A34A', accent: false,
      tooltip: `Produtivo: ${fmtMin(totalProdMin)}\nPerdas: ${fmtMin(totalLossMin)}\nBase: ${fmtMin(totalMin)}`,
    },
    {
      key: 'loss', label: 'Maior Perda', icon: <TrendingDown sx={{ fontSize: 18 }} />,
      color: '#F59E0B', bg: 'rgba(245,158,11,0.08)',
      value: topLossCategory || '-',
      sub: topLossMin > 0 ? fmtMin(topLossMin) : undefined,
      subColor: '#F59E0B', accent: false,
      tooltip: topLossCategory
        ? `"${topLossCategory}" = ${fmtMin(topLossMin)} (${totalMin > 0 ? Math.round((topLossMin / totalMin) * 100) : 0}%)`
        : 'Sem perdas.',
    },
    {
      key: 'colab', label: 'Colaboradores', icon: <People sx={{ fontSize: 18 }} />,
      color: '#8B5CF6', bg: 'rgba(139,92,246,0.08)',
      value: totalColaboradores?.toLocaleString('pt-BR') ?? '-',
      sub: undefined, subColor: undefined, accent: false,
      tooltip: 'Colaboradores com RDO no periodo.',
    },
    ...(hasOvertime ? [{
      key: 'hex', label: 'Hora Extra', icon: <MoreTime sx={{ fontSize: 18 }} />,
      color: '#1D4ED8', bg: 'rgba(29,78,216,0.10)',
      value: `+${fmtMin(overtimeMin!)}`,
      sub: overtimeProdMin && overtimeMin! > 0
        ? `${Math.round((overtimeProdMin / overtimeMin!) * 100)}% prod`
        : undefined,
      subColor: '#16A34A', accent: true,
      tooltip: `HE total: ${fmtMin(overtimeMin!)}\nProd: ${fmtMin(overtimeProdMin ?? 0)}\nImprod: ${fmtMin(overtimeNonProdMin ?? 0)}`,
    }] : []),
  ];

  // Mobile: compact horizontal rows stacked vertically
  if (isMobile) {
    return (
      <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
        {cards.map((c, idx) => (
          <Tooltip key={c.key} title={c.tooltip} arrow placement="top"
            slotProps={{ tooltip: { sx: { whiteSpace: 'pre-line', maxWidth: 240 } } }}>
            <Box
              sx={{
                display: 'flex', alignItems: 'center', gap: 1,
                px: 1.5, py: 1,
                ...(idx < cards.length - 1 && { borderBottom: 1, borderColor: 'divider' }),
                ...(c.accent && { borderLeft: '3px solid', borderColor: c.color }),
              }}
            >
              <Box sx={{
                display: 'flex', p: 0.5, borderRadius: 1, bgcolor: c.bg, color: c.color,
              }}>
                {c.icon}
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ minWidth: 70 }}>
                {c.label}
              </Typography>
              <Typography fontWeight={700} sx={{
                flex: 1, textAlign: 'right', fontSize: '0.95rem',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                ...(c.accent && { color: c.color }),
              }}>
                {c.value}
              </Typography>
              {c.sub && (
                <Chip label={c.sub} size="small" sx={{
                  height: 18, fontSize: 10, fontWeight: 600,
                  bgcolor: `${c.subColor}15`, color: c.subColor, flexShrink: 0,
                }} />
              )}
            </Box>
          </Tooltip>
        ))}
      </Paper>
    );
  }

  // Desktop: grid cards
  return (
    <Box sx={{
      display: 'grid', gap: 1,
      gridTemplateColumns: {
        sm: 'repeat(3, 1fr)',
        md: `repeat(${Math.min(cards.length, 5)}, 1fr)`,
      },
    }}>
      {cards.map((c) => (
        <Tooltip key={c.key} title={c.tooltip} arrow placement="top"
          slotProps={{ tooltip: { sx: { whiteSpace: 'pre-line', maxWidth: 240 } } }}>
          <Paper
            sx={{
              px: 1.5, py: 1, borderRadius: 2, cursor: 'help',
              ...(c.accent && { borderLeft: '3px solid', borderColor: c.color }),
            }}
          >
            <Typography
              variant="overline" color="text.secondary"
              sx={{ fontSize: '0.6rem', lineHeight: 1.2, letterSpacing: '0.05em' }}
            >
              {c.label}
            </Typography>
            <Stack direction="row" spacing={0.75} alignItems="center">
              <Box sx={{
                display: 'flex', p: 0.5, borderRadius: 1, bgcolor: c.bg, color: c.color,
              }}>
                {c.icon}
              </Box>
              <Typography
                fontWeight={700} lineHeight={1}
                sx={{
                  fontSize: '1.2rem',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  ...(c.accent && { color: c.color }),
                }}
              >
                {c.value}
              </Typography>
            </Stack>
            {c.sub && (
              <Chip label={c.sub} size="small" sx={{
                mt: 0.5, height: 18, fontSize: 10, fontWeight: 600,
                bgcolor: `${c.subColor}15`, color: c.subColor,
              }} />
            )}
          </Paper>
        </Tooltip>
      ))}
    </Box>
  );
}
