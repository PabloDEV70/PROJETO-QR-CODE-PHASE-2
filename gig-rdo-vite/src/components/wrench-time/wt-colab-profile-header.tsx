import { Box, Chip, LinearProgress, Paper, Stack, Typography } from '@mui/material';
import { AccessTime, CheckCircle, EmojiEvents, TrendingUp, Warning } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { FuncionarioAvatar } from '@/components/shared/funcionario-avatar';
import { fmtMin, getBenchmarkColor } from '@/utils/wrench-time-categories';
import type { ColaboradorTimelineResponse, ColaboradorTimelineDia } from '@/types/rdo-types';

interface WtColabProfileHeaderProps {
  colab: ColaboradorTimelineResponse['colaborador'];
  dia: ColaboradorTimelineDia;
  dtref: string;
  codparc: number;
}

function fmtBr(d: string) {
  return d.length >= 10 ? `${d.slice(8, 10)}/${d.slice(5, 7)}/${d.slice(0, 4)}` : d;
}

export function WtColabProfileHeader({ colab, dia, dtref, codparc }: WtColabProfileHeaderProps) {
  const j = dia.jornada;
  const m = dia.meta;
  const r = dia.resumo;
  const rdoCodes = [...new Set(dia.atividades.map((a) => a.codrdo))];
  const metaColor = m.atingiuMeta ? '#16A34A' : '#EF4444';
  const benchStatus = r.percentProdutivo >= 50 ? 'above' : r.percentProdutivo >= 35 ? 'target' : 'below';
  const prodColor = getBenchmarkColor(benchStatus);

  return (
    <Paper sx={{
      p: 0, borderRadius: 3, overflow: 'hidden',
      borderLeft: '4px solid', borderColor: metaColor,
    }}>
      <Stack direction={{ xs: 'column', md: 'row' }} sx={{ p: 2.5 }} spacing={2.5}>
        {/* Left: Avatar + info */}
        <Stack direction="row" spacing={2} sx={{ flex: 1, minWidth: 0 }}>
          <FuncionarioAvatar codparc={codparc} nome={colab.nome} size="large" />
          <Stack spacing={0.5} sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h5" fontWeight={700} noWrap>{colab.nome}</Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {[colab.departamento, colab.cargo, colab.funcao].filter(Boolean).join(' · ')}
            </Typography>
            {colab.empresa && (
              <Typography variant="caption" color="text.secondary">{colab.empresa}</Typography>
            )}
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mt: 0.5 }}>
              <Chip label={fmtBr(dtref)} variant="outlined" size="small" sx={{ fontWeight: 600 }} />
              {rdoCodes.map((code) => (
                <Chip
                  key={code} size="small" label={`RDO ${code}`}
                  color="primary" variant="outlined" clickable
                  component={RouterLink} to={`/rdo/${code}`}
                />
              ))}
            </Stack>
          </Stack>
        </Stack>

        {/* Right: Jornada summary card */}
        <Paper variant="outlined" sx={{
          p: 2, borderRadius: 2, minWidth: 260, bgcolor: 'grey.50',
        }}>
          <Stack spacing={1.5}>
            {/* Meta badge */}
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Stack direction="row" alignItems="center" spacing={0.75}>
                {m.percentMeta >= 100
                  ? <EmojiEvents sx={{ fontSize: 20, color: '#F59E0B' }} />
                  : <TrendingUp sx={{ fontSize: 20, color: metaColor }} />}
                <Typography variant="h6" fontWeight={700} sx={{ color: metaColor }}>
                  {m.percentMeta}%
                </Typography>
                <Typography variant="caption" color="text.secondary">meta</Typography>
              </Stack>
              {j && (
                j.cumpriuJornada
                  ? <Chip icon={<CheckCircle />} label="Cumpriu" size="small" color="success" variant="outlined" />
                  : <Chip icon={<Warning />} label="Nao Cumpriu" size="small" color="warning" variant="outlined" />
              )}
            </Stack>

            {/* Produtivo progress bar */}
            <Box>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                <Typography variant="caption" color="text.secondary">Produtivo</Typography>
                <Typography variant="caption" fontWeight={600} sx={{ color: prodColor }}>
                  {r.percentProdutivo}%
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate" value={Math.min(r.percentProdutivo, 100)}
                sx={{
                  height: 6, borderRadius: 3, bgcolor: 'grey.200',
                  '& .MuiLinearProgress-bar': { bgcolor: prodColor, borderRadius: 3 },
                }}
              />
            </Box>

            {/* Duration row */}
            <Stack direction="row" spacing={2}>
              <Stack>
                <Typography variant="caption" color="text.secondary">Trabalhado</Typography>
                <Typography variant="body2" fontWeight={600}>{fmtMin(r.totalMinutos)}</Typography>
              </Stack>
              <Stack>
                <Typography variant="caption" color="text.secondary">Previsto</Typography>
                <Typography variant="body2" fontWeight={600}>{fmtMin(m.cargaHorariaPrevistaMin)}</Typography>
              </Stack>
              {m.horaExtraMin > 0 && (
                <Stack>
                  <Typography variant="caption" color="text.secondary">H.Extra</Typography>
                  <Typography variant="body2" fontWeight={600} color="primary">
                    +{fmtMin(m.horaExtraMin)}
                  </Typography>
                </Stack>
              )}
            </Stack>

            {/* Jornada times */}
            {j && (
              <Stack direction="row" spacing={0.5} alignItems="center">
                <AccessTime sx={{ fontSize: 14, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">
                  {j.primeiraAtividade} — {j.ultimaAtividade}
                </Typography>
                {j.atrasoMin > 0 && (
                  <Chip label={`Atraso ${fmtMin(j.atrasoMin)}`} size="small"
                    sx={{ height: 18, fontSize: 10, bgcolor: '#F59E0B22', color: '#B45309', fontWeight: 600 }} />
                )}
                {j.saidaAntecipadaMin > 0 && (
                  <Chip label={`Saiu cedo ${fmtMin(j.saidaAntecipadaMin)}`} size="small"
                    sx={{ height: 18, fontSize: 10, bgcolor: '#EF444422', color: '#B91C1C', fontWeight: 600 }} />
                )}
              </Stack>
            )}
          </Stack>
        </Paper>
      </Stack>
    </Paper>
  );
}
