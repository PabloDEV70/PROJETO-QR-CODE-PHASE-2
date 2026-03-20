import { Box, Chip, Paper, Skeleton, Stack, Tooltip, Typography } from '@mui/material';
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
  const hasOvertime = (overtimeMin ?? 0) > 0;

  if (isLoading) {
    return (
      <Box sx={{
        display: 'grid', gap: 2,
        gridTemplateColumns: {
          xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)',
        },
      }}>
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} variant="rounded" height={90} sx={{ borderRadius: 2.5 }} />
        ))}
      </Box>
    );
  }

  const wtColor = benchmarkStatus ? getBenchmarkColor(benchmarkStatus) : '#64748B';
  const totalMin = totalProdMin + totalLossMin;

  const cards = [
    {
      key: 'wt', label: 'WRENCH TIME', icon: <Speed />,
      color: wtColor, bg: `${wtColor}15`,
      value: wrenchTimePercent != null ? `${wrenchTimePercent}%` : '-',
      sub: benchmarkStatus ? benchmarkLabel(benchmarkStatus) : undefined,
      subColor: wtColor, accent: false,
      tooltip: `Wrench Time = Horas produtivas / Base efetiva\n`
        + `Produtivo: ${fmtMin(totalProdMin)}\nBase efetiva: ${fmtMin(totalMin)}\n`
        + `Meta: >=50% (Excelente), 35-49% (Na Faixa), <35% (Critico)`,
    },
    {
      key: 'prod', label: 'HORAS PRODUTIVAS', icon: <AccessTime />,
      color: '#16A34A', bg: 'rgba(22,163,74,0.08)',
      value: fmtMin(totalProdMin),
      sub: totalMin > 0 ? `${wrenchTimePercent ?? 0}% de ${fmtMin(totalMin)}` : undefined,
      subColor: '#16A34A', accent: false,
      tooltip: `Tempo total com ferramenta na mao (motivos produtivos).\n`
        + `Produtivo: ${fmtMin(totalProdMin)}\nPerdas: ${fmtMin(totalLossMin)}\n`
        + `Base efetiva: ${fmtMin(totalMin)} (bruto - almoco programado - banheiro tolerado)`,
    },
    {
      key: 'loss', label: 'PRINCIPAL PERDA', icon: <TrendingDown />,
      color: '#F59E0B', bg: 'rgba(245,158,11,0.08)',
      value: topLossCategory || '-',
      sub: topLossMin > 0 ? fmtMin(topLossMin) : undefined,
      subColor: '#F59E0B', accent: false,
      tooltip: topLossCategory
        ? `A categoria "${topLossCategory}" representa a maior perda de tempo no periodo.\n`
          + `Total: ${fmtMin(topLossMin)} (${totalMin > 0 ? Math.round((topLossMin / totalMin) * 100) : 0}% da base efetiva)`
        : 'Sem perdas registradas no periodo.',
    },
    {
      key: 'colab', label: 'COLABORADORES', icon: <People />,
      color: '#8B5CF6', bg: 'rgba(139,92,246,0.08)',
      value: totalColaboradores?.toLocaleString('pt-BR') ?? '-',
      sub: undefined, subColor: undefined, accent: false,
      tooltip: 'Total de colaboradores com RDO registrado no periodo filtrado.',
    },
    ...(hasOvertime ? [{
      key: 'hex', label: 'HORA EXTRA', icon: <MoreTime />,
      color: '#1D4ED8', bg: 'rgba(29,78,216,0.10)',
      value: `+${fmtMin(overtimeMin!)}`,
      sub: overtimeProdMin && overtimeMin! > 0
        ? `${Math.round((overtimeProdMin / overtimeMin!) * 100)}% produtiva`
        : undefined,
      subColor: '#16A34A', accent: true,
      tooltip: `Hora extra total: ${fmtMin(overtimeMin!)}\n`
        + `Produtiva: ${fmtMin(overtimeProdMin ?? 0)}\n`
        + `Improdutiva: ${fmtMin(overtimeNonProdMin ?? 0)}`,
    }] : []),
  ];

  const cols = cards.length;

  return (
    <Box sx={{
      display: 'grid', gap: 2,
      gridTemplateColumns: {
        xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)',
        md: `repeat(${Math.min(cols, 4)}, 1fr)`, lg: `repeat(${cols}, 1fr)`,
      },
    }}>
      {cards.map((c) => (
        <Tooltip key={c.key} title={c.tooltip} arrow placement="top"
          slotProps={{ tooltip: { sx: { whiteSpace: 'pre-line', maxWidth: 280 } } }}>
          <Paper
            data-hoverable
            sx={{
              px: 2, py: 1.5, height: '100%', borderRadius: 2.5, cursor: 'help',
              ...(c.accent && { borderLeft: '3px solid', borderColor: c.color }),
            }}
          >
            <Stack spacing={0.5}>
              <Typography
                variant="overline" color="text.secondary"
                sx={{ fontSize: '0.6875rem', lineHeight: 1.2 }}
              >
                {c.label}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Box sx={{
                  display: 'flex', p: 0.75, borderRadius: 1.5, bgcolor: c.bg, color: c.color,
                }}>
                  {c.icon}
                </Box>
                <Typography
                  fontWeight={700} lineHeight={1}
                  sx={{
                    fontSize: { xs: '1.15rem', sm: '1.35rem', lg: '1.5rem' },
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    ...(c.accent && { color: c.color }),
                  }}
                >
                  {c.value}
                </Typography>
              </Stack>
              {c.sub && (
                <Chip label={c.sub} size="small" sx={{
                  alignSelf: 'flex-start', height: 20, fontSize: 11, fontWeight: 600,
                  bgcolor: `${c.subColor}15`, color: c.subColor,
                }} />
              )}
            </Stack>
          </Paper>
        </Tooltip>
      ))}
    </Box>
  );
}
