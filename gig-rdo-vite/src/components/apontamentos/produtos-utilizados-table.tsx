import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, Skeleton,
} from '@mui/material';
import type { ProdutoUtilizado } from '@/types/apontamentos-types';

interface ProdutosUtilizadosTableProps {
  produtos: ProdutoUtilizado[] | undefined;
  isLoading: boolean;
}

export function ProdutosUtilizadosTable({ produtos, isLoading }: ProdutosUtilizadosTableProps) {
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>
        Produtos Utilizados (Top 50)
      </Typography>
      <TableContainer sx={{ maxHeight: 400 }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell width={80}>Cod</TableCell>
              <TableCell>Produto</TableCell>
              <TableCell width={70} align="right">Usos</TableCell>
              <TableCell width={70} align="right">Qtd Total</TableCell>
              <TableCell width={70} align="right">Com OS</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 5 }).map((__, j) => (
                    <TableCell key={j}><Skeleton /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              produtos?.map((p) => (
                <TableRow key={p.CODPROD} hover>
                  <TableCell sx={{ fontSize: 13 }}>{p.CODPROD}</TableCell>
                  <TableCell sx={{ fontSize: 13 }}>{p.DESCRPROD ?? '-'}</TableCell>
                  <TableCell align="right" sx={{ fontSize: 13, fontWeight: 600 }}>
                    {p.QTD_UTILIZACOES}
                  </TableCell>
                  <TableCell align="right" sx={{ fontSize: 13 }}>{p.QTD_TOTAL}</TableCell>
                  <TableCell align="right" sx={{ fontSize: 13 }}>{p.QTD_COM_OS}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
