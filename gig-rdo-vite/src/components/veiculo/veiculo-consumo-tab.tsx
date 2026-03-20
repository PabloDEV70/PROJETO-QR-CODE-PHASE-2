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
import type { VeiculoConsumo } from '@/types/veiculo-tabs-types';

interface Props {
  items?: VeiculoConsumo[];
  isLoading: boolean;
}

function safeFmt(v: string | Date | null, fmt = 'dd/MM/yyyy'): string {
  if (!v) return '-';
  const d = typeof v === 'string' ? parseISO(v) : new Date(v);
  return isValid(d) ? format(d, fmt) : '-';
}

function fmtBrl(v: number | null): string {
  if (v == null) return '-';
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function fmtDec(v: number | null, digits = 2): string {
  if (v == null) return '-';
  return v.toFixed(digits);
}

const COLS = ['Data', 'Litros', 'KM/L', 'Valor Medio', 'KM Rodados', 'Horas Trab', 'Motorista'];

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

export function VeiculoConsumoTab({ items, isLoading }: Props) {
  const list = items ?? [];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
        Consumo de Combustivel ({isLoading ? '...' : list.length})
      </Typography>

      {!isLoading && list.length === 0 ? (
        <Typography color="text.secondary">Nenhum registro de consumo</Typography>
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
                  <TableRow key={r.ID}>
                    <TableCell>{safeFmt(r.DATA_ABASTECIMENTO)}</TableCell>
                    <TableCell>{fmtDec(r.LITROS)}</TableCell>
                    <TableCell>{fmtDec(r.KMPORLITRO)}</TableCell>
                    <TableCell>{fmtBrl(r.VALORMEDIOLITRO)}</TableCell>
                    <TableCell>{r.KMRODADOS?.toLocaleString() ?? '-'}</TableCell>
                    <TableCell>{r.HORASTRABALHADAS ?? '-'}</TableCell>
                    <TableCell>{r.MOTORISTA ?? '-'}</TableCell>
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
