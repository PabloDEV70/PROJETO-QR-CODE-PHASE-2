import {
  Paper, Typography, Chip, Stack, Tooltip,
  Table, TableHead, TableBody, TableRow, TableCell,
} from '@mui/material';
import { WarningAmber } from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import type { OsColabServico } from '@/types/os-list-types';

const LIMITE_JORNADA_MIN = 720; // 12h — acima disso e anomalia

function fmtDate(val: string | null) {
  if (!val) return '-';
  try { return format(parseISO(val), 'dd/MM HH:mm'); } catch { return val; }
}

function fmtTempo(min: number) {
  if (min <= 0) return '0';
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m}`;
  return `${h}h${m > 0 ? ` ${m}` : ''}`;
}

interface OsServicosTableProps {
  servicos: OsColabServico[];
}

export function OsServicosTable({ servicos }: OsServicosTableProps) {
  const totalMin = servicos.reduce((acc, s) => acc + (s.tempoGastoMin ?? 0), 0);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  const anomalias = servicos.filter((s) => s.tempoGastoMin > LIMITE_JORNADA_MIN).length;

  return (
    <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
      <Stack direction="row" spacing={2} sx={{ px: 2, py: 1.5 }} alignItems="center">
        <Typography variant="subtitle2" fontWeight={700}>
          {servicos.length} servico{servicos.length !== 1 ? 's' : ''}
        </Typography>
        <Chip size="small" label={`${h}h ${m}min`} color="primary" variant="outlined" />
        {servicos[0]?.nomeExecutor && (
          <Chip size="small" label={servicos[0].nomeExecutor.trim()} color="info"
            variant="outlined" />
        )}
        {anomalias > 0 && (
          <Chip size="small" icon={<WarningAmber sx={{ fontSize: 14 }} />}
            label={`${anomalias} anomalia${anomalias > 1 ? 's' : ''}`}
            color="warning" variant="outlined" />
        )}
      </Stack>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>OS / Seq</TableCell>
            <TableCell>Abertura</TableCell>
            <TableCell>Servico</TableCell>
            <TableCell>Veiculo</TableCell>
            <TableCell>Tipo</TableCell>
            <TableCell>Manutencao</TableCell>
            <TableCell>Inicio</TableCell>
            <TableCell>Fim</TableCell>
            <TableCell align="right">Tempo</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {servicos.map((s, i) => {
            const anomalo = s.tempoGastoMin > LIMITE_JORNADA_MIN;
            return (
              <TableRow key={`${s.NUOS}-${s.sequencia}-${i}`}
                sx={{
                  '&:hover': { bgcolor: 'action.hover' },
                  ...(anomalo ? { bgcolor: 'rgba(255,152,0,0.06)' } : {}),
                }}>
                <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                  {s.NUOS}
                  <Typography component="span" variant="caption" color="text.secondary">
                    {' / '}{s.sequencia}
                  </Typography>
                </TableCell>
                <TableCell>{fmtDate(s.DTABERTURA)}</TableCell>
                <TableCell>{s.nomeServico?.trim() ?? '-'}</TableCell>
                <TableCell>
                  {s.placa?.trim() ?? '-'}
                  {s.marcaModelo?.trim() ? ` (${s.marcaModelo.trim()})` : ''}
                </TableCell>
                <TableCell>
                  <Chip label={s.tipoLabel ?? s.TIPO ?? '-'} size="small" variant="outlined"
                    color={s.TIPO === 'I' ? 'primary' : s.TIPO === 'E' ? 'secondary' : 'default'}
                    sx={{ fontSize: '0.65rem', height: 20 }} />
                </TableCell>
                <TableCell>
                  <Typography variant="caption" noWrap sx={{ fontSize: '0.7rem' }}>
                    {s.manutencaoLabel ?? s.MANUTENCAO ?? '-'}
                  </Typography>
                </TableCell>
                <TableCell>{fmtDate(s.dtInicio)}</TableCell>
                <TableCell>{fmtDate(s.dtFim)}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                  {anomalo ? (
                    <Tooltip title={`${s.tempoGastoMin} min — provavel erro de apontamento`}>
                      <Stack direction="row" spacing={0.5} alignItems="center"
                        justifyContent="flex-end">
                        <WarningAmber sx={{ fontSize: 14, color: 'warning.main' }} />
                        <Typography variant="body2" fontWeight={700} color="warning.main">
                          {fmtTempo(s.tempoGastoMin)}
                        </Typography>
                      </Stack>
                    </Tooltip>
                  ) : (
                    fmtTempo(s.tempoGastoMin)
                  )}
                </TableCell>
                <TableCell>
                  <Chip label={s.statusLabel} size="small" variant="outlined"
                    color={s.STATUS === 'F' ? 'success' : s.STATUS === 'E' ? 'info' : 'default'}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Paper>
  );
}
