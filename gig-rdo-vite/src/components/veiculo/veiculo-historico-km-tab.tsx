import {
  Box,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { format, parseISO, isValid } from 'date-fns';
import type { VeiculoHistoricoKm } from '@/types/veiculo-tabs-types';

interface Props {
  items?: VeiculoHistoricoKm[];
  isLoading: boolean;
}

function safeFmt(v: string | Date | null, fmt = 'dd/MM/yyyy'): string {
  if (!v) return '-';
  const d = typeof v === 'string' ? parseISO(v) : new Date(v);
  return isValid(d) ? format(d, fmt) : '-';
}

const COLS = ['Data Ref', 'KM', 'Horimetro', 'Odometro', 'Origem', 'Seq'];

function LoadingSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          {COLS.map((c) => (
            <TableCell key={c}>
              <Skeleton variant="text" width="80%" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

export function VeiculoHistoricoKmTab({ items, isLoading }: Props) {
  const list = items ?? [];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
        Historico de KM ({isLoading ? '...' : list.length})
      </Typography>

      {!isLoading && list.length === 0 ? (
        <Typography color="text.secondary">Nenhum registro de KM</Typography>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                {COLS.map((c) => (
                  <TableCell key={c} sx={{ fontWeight: 600 }}>
                    {c}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <LoadingSkeleton />
              ) : (
                list.map((r) => (
                  <TableRow key={`${r.CODVEICULO}-${r.SEQUENCIA}`}>
                    <TableCell>{safeFmt(r.DHREFERENCIA)}</TableCell>
                    <TableCell>{r.KM?.toLocaleString() ?? '-'}</TableCell>
                    <TableCell>{r.AD_HORIMETRO ?? '-'}</TableCell>
                    <TableCell>{r.AD_ODOMETRO ?? '-'}</TableCell>
                    <TableCell>{r.ORIGEM ?? '-'}</TableCell>
                    <TableCell>{r.SEQUENCIA}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
