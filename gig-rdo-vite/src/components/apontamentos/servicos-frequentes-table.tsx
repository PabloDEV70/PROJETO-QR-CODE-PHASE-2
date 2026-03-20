import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, LinearProgress, Skeleton, Box,
} from '@mui/material';
import type { ServicoFrequente } from '@/types/apontamentos-types';

interface ServicosFrequentesTableProps {
  servicos: ServicoFrequente[] | undefined;
  isLoading: boolean;
}

export function ServicosFrequentesTable({ servicos, isLoading }: ServicosFrequentesTableProps) {
  const maxQtd = servicos?.reduce((max, s) => Math.max(max, s.QTD_APONTAMENTOS), 0) ?? 1;

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>
        Servicos Frequentes (Top 20)
      </Typography>
      <TableContainer sx={{ maxHeight: 400 }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Descritivo</TableCell>
              <TableCell width={80} align="right">Qtd</TableCell>
              <TableCell width={140}>Frequencia</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton /></TableCell>
                  <TableCell><Skeleton width={30} /></TableCell>
                  <TableCell><Skeleton /></TableCell>
                </TableRow>
              ))
            ) : (
              servicos?.map((s, i) => (
                <TableRow key={i} hover>
                  <TableCell sx={{ fontSize: 13 }}>{s.DESCRITIVO}</TableCell>
                  <TableCell align="right" sx={{ fontSize: 13, fontWeight: 600 }}>
                    {s.QTD_APONTAMENTOS}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={(s.QTD_APONTAMENTOS / maxQtd) * 100}
                        sx={{ flex: 1, height: 6, borderRadius: 3 }}
                      />
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
