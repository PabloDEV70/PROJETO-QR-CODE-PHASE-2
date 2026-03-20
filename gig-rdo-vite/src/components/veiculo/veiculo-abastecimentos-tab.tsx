import {
  Box,
  Chip,
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
import type { VeiculoAbastecimento } from '@/types/veiculo-tabs-types';

interface Props {
  items?: VeiculoAbastecimento[];
  isLoading: boolean;
}

function safeFmt(v: string | Date | null, fmt = 'dd/MM/yyyy'): string {
  if (!v) return '-';
  const d = typeof v === 'string' ? parseISO(v) : new Date(v);
  return isValid(d) ? format(d, fmt) : '-';
}

const COLS = ['Data', 'KM', 'Horimetro', 'Status', 'Num Abast', 'Posto', 'NF'];

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

export function VeiculoAbastecimentosTab({ items, isLoading }: Props) {
  const list = items ?? [];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
        Abastecimentos ({isLoading ? '...' : list.length})
      </Typography>

      {!isLoading && list.length === 0 ? (
        <Typography color="text.secondary">Nenhum abastecimento</Typography>
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
                  <TableRow key={r.IDABT}>
                    <TableCell>{safeFmt(r.DHABT)}</TableCell>
                    <TableCell>{r.KM?.toLocaleString() ?? '-'}</TableCell>
                    <TableCell>{r.HORIMETRO ?? '-'}</TableCell>
                    <TableCell>
                      {r.STATUS ? (
                        <Chip
                          label={r.STATUS}
                          size="small"
                          sx={{ height: 20, fontSize: '0.65rem' }}
                        />
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>{r.NUMABT ?? '-'}</TableCell>
                    <TableCell>{r.CODPOSTO ?? '-'}</TableCell>
                    <TableCell>{r.NUNOTA ?? '-'}</TableCell>
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
