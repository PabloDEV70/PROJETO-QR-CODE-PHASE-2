import { Box, Chip, Paper, Stack, Tooltip, Typography } from '@mui/material';
import { Category, AccessTime } from '@mui/icons-material';
import { fmtMin, getCategoryMeta } from '@/utils/wrench-time-categories';

interface MotivoItem {
  rdomotivocod: number;
  motivoDescricao: string;
  motivoSigla: string;
  duracaoMinutos: number;
  isProdutivo: boolean;
}

interface WtColabMotivoBreakdownProps {
  atividades: MotivoItem[];
}

interface MotivoAggregated {
  rdomotivocod: number;
  descricao: string;
  sigla: string;
  totalMin: number;
  isProdutivo: boolean;
  count: number;
}

export function WtColabMotivoBreakdown({ atividades }: WtColabMotivoBreakdownProps) {
  if (!atividades.length) {
    return (
      <Paper sx={{ p: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Category color="disabled" />
          <Typography variant="body2" color="text.secondary">
            Sem atividades registradas
          </Typography>
        </Stack>
      </Paper>
    );
  }

  const aggregated = atividades.reduce<Record<number, MotivoAggregated>>(
    (acc, a) => {
      let entry = acc[a.rdomotivocod];
      if (!entry) {
        entry = {
          rdomotivocod: a.rdomotivocod,
          descricao: a.motivoDescricao,
          sigla: a.motivoSigla,
          totalMin: 0,
          isProdutivo: a.isProdutivo,
          count: 0,
        };
        acc[a.rdomotivocod] = entry;
      }
      entry.totalMin += a.duracaoMinutos;
      entry.count += 1;
      return acc;
    },
    {},
  );

  const motivos = Object.values(aggregated).sort((a, b) => b.totalMin - a.totalMin);
  const totalMin = motivos.reduce((s, m) => s + m.totalMin, 0);

  return (
    <Paper sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Category color="primary" fontSize="small" />
          <Typography variant="subtitle2" fontWeight={600}>
            Breakdown por Motivo
          </Typography>
          <Typography variant="caption" color="text.secondary">
            ({motivos.length} motivos, {fmtMin(totalMin)})
          </Typography>
        </Stack>

        <Stack spacing={1.5}>
          {motivos.map((m) => {
            const pct = totalMin > 0 ? Math.round((m.totalMin / totalMin) * 100) : 0;
            const meta = m.isProdutivo
              ? getCategoryMeta('wrenchTime')
              : getCategoryMeta('pausas');

            return (
              <Stack key={m.rdomotivocod} spacing={0.5}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography variant="body2" fontWeight={500} sx={{ minWidth: 80, fontSize: 13 }}>
                    {m.sigla}
                  </Typography>
                  <Box sx={{ flex: 1 }}>
                    <Tooltip title={m.descricao} arrow>
                      <Box
                        sx={{
                          height: 8,
                          bgcolor: meta.color,
                          borderRadius: 1,
                          width: `${Math.max(pct, 2)}%`,
                          minWidth: 4,
                          opacity: 0.8,
                        }}
                      />
                    </Tooltip>
                  </Box>
                  <Stack direction="row" alignItems="center" spacing={0.5} sx={{ minWidth: 90, justifyContent: 'flex-end' }}>
                    <AccessTime sx={{ fontSize: 12, color: 'text.secondary' }} />
                    <Typography variant="body2" fontWeight={500} fontSize={13}>
                      {fmtMin(m.totalMin)}
                    </Typography>
                  </Stack>
                  <Chip
                    size="small"
                    label={`${pct}%`}
                    sx={{
                      height: 18,
                      fontSize: 10,
                      fontWeight: 600,
                      minWidth: 45,
                      bgcolor: m.isProdutivo ? '#16A34A22' : '#94A3B822',
                      color: m.isProdutivo ? '#16A34A' : '#64748B',
                    }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ minWidth: 50, textAlign: 'right' }}>
                    {m.count}x
                  </Typography>
                </Stack>
                <Typography variant="caption" color="text.secondary" sx={{ pl: 10.5 }}>
                  {m.descricao}
                </Typography>
              </Stack>
            );
          })}
        </Stack>
      </Stack>
    </Paper>
  );
}
