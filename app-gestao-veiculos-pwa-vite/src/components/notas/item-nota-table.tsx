import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from '@mui/material';
import type { ItemNota } from '@/types/hstvei-types';

interface ItemNotaTableProps {
  items: ItemNota[];
}

export function ItemNotaTable({ items }: ItemNotaTableProps) {
  if (items.length === 0) return <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>Nenhum item encontrado</Typography>;

  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 700, fontSize: '0.7rem' }}>Produto</TableCell>
            <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.7rem' }}>Qtd</TableCell>
            <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.7rem' }}>Vlr Unit</TableCell>
            <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.7rem' }}>Total</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item) => (
            <TableRow key={`${item.nunota}-${item.sequencia}`}>
              <TableCell sx={{ fontSize: '0.7rem' }}>{item.produto}</TableCell>
              <TableCell align="right" sx={{ fontSize: '0.7rem' }}>{item.quantidade}</TableCell>
              <TableCell align="right" sx={{ fontSize: '0.7rem' }}>
                {item.valorUnitario != null ? `R$ ${item.valorUnitario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-'}
              </TableCell>
              <TableCell align="right" sx={{ fontSize: '0.7rem', fontWeight: 600 }}>
                {item.valorTotal != null ? `R$ ${item.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
