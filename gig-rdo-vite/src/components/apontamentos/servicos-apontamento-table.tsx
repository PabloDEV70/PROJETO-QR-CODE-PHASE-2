import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, Skeleton, Chip,
} from '@mui/material';
import { format, parseISO } from 'date-fns';
import type { ApontamentoServico } from '@/types/apontamentos-types';

interface ServicosApontamentoTableProps {
  servicos: ApontamentoServico[] | undefined;
  isLoading: boolean;
}

function fmtDate(val: string | null | undefined) {
  if (!val) return '-';
  try { return format(parseISO(val), 'dd/MM/yyyy'); }
  catch { return val; }
}

export function ServicosApontamentoTable({
  servicos, isLoading,
}: ServicosApontamentoTableProps) {
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>
        Servicos do Apontamento
      </Typography>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell width={60}>Seq</TableCell>
              <TableCell>Descritivo</TableCell>
              <TableCell width={120}>Produto</TableCell>
              <TableCell width={60} align="right">Qtd</TableCell>
              <TableCell width={80}>Gera OS</TableCell>
              <TableCell width={80}>OS</TableCell>
              <TableCell width={100}>Programacao</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 7 }).map((__, j) => (
                    <TableCell key={j}><Skeleton /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              servicos?.map((s) => (
                <TableRow key={s.SEQ} hover>
                  <TableCell sx={{ fontSize: 13 }}>{s.SEQ}</TableCell>
                  <TableCell sx={{ fontSize: 13 }}>{s.DESCRITIVO ?? '-'}</TableCell>
                  <TableCell sx={{ fontSize: 13 }}>{s.DESCRPROD ?? '-'}</TableCell>
                  <TableCell align="right" sx={{ fontSize: 13 }}>{s.QTD ?? '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={s.GERAOS === 'S' ? 'Sim' : 'Nao'}
                      size="small"
                      color={s.GERAOS === 'S' ? 'success' : 'default'}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell sx={{ fontSize: 13 }}>{s.NUOS ?? '-'}</TableCell>
                  <TableCell sx={{ fontSize: 13 }}>{fmtDate(s.DTPROGRAMACAO)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
