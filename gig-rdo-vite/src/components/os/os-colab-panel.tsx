import {
  Paper,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Stack,
  Chip,
  Skeleton,
} from '@mui/material';
import { format, parseISO } from 'date-fns';
import type { OsColabServico } from '@/types/os-list-types';

interface OsColabPanelProps {
  servicos: OsColabServico[] | undefined;
  isLoading: boolean;
  codusu: string | null;
}

function fmtDate(val: string | null) {
  if (!val) return '-';
  try {
    return format(parseISO(val), 'dd/MM HH:mm');
  } catch {
    return val;
  }
}

export function OsColabPanel({ servicos, isLoading, codusu }: OsColabPanelProps) {
  if (!codusu) return null;

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
        Servicos do Executor
        {servicos?.[0]?.nomeExecutor ? ` — ${servicos[0].nomeExecutor.trim()}` : ''}
      </Typography>
      {isLoading ? (
        <Stack spacing={1}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} height={32} />
          ))}
        </Stack>
      ) : !servicos?.length ? (
        <Typography color="text.secondary" variant="body2">
          Nenhum servico encontrado para este executor no periodo.
        </Typography>
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>OS</TableCell>
              <TableCell>Servico</TableCell>
              <TableCell>Veiculo</TableCell>
              <TableCell>Inicio</TableCell>
              <TableCell>Fim</TableCell>
              <TableCell>Tempo (min)</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {servicos.map((s, i) => (
              <TableRow key={`${s.NUOS}-${s.sequencia}-${i}`}>
                <TableCell>{s.NUOS}</TableCell>
                <TableCell>{s.nomeServico ?? '-'}</TableCell>
                <TableCell>
                  {s.placa ?? '-'}{s.marcaModelo ? ` (${s.marcaModelo})` : ''}
                </TableCell>
                <TableCell>{fmtDate(s.dtInicio)}</TableCell>
                <TableCell>{fmtDate(s.dtFim)}</TableCell>
                <TableCell>{s.tempoGastoMin}</TableCell>
                <TableCell>
                  <Chip label={s.statusLabel} size="small" variant="outlined" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Paper>
  );
}
