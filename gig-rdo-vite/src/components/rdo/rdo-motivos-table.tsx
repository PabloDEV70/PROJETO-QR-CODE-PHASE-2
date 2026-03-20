import {
  Paper, Typography, Table, TableHead, TableRow,
  TableCell, TableBody, Box, LinearProgress, Stack,
} from '@mui/material';
import type { RdoAnalyticsMotivo } from '@/types/rdo-types';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { EmptyState } from '@/components/shared/empty-state';

interface RdoMotivosTableProps {
  motivos?: RdoAnalyticsMotivo[];
  isLoading: boolean;
}

const barColors = [
  '#1976d2', '#2e7d32', '#ed6c02', '#7b1fa2', '#0288d1',
  '#558b2f', '#c62828', '#6a1b9a', '#00838f', '#ef6c00',
];

export function RdoMotivosTable({ motivos, isLoading }: RdoMotivosTableProps) {
  if (isLoading) return <LoadingSkeleton rows={5} height={40} />;

  if (!motivos?.length) {
    return (
      <Paper sx={{ p: 3 }}>
        <EmptyState message="Sem dados de motivos para o periodo selecionado" />
      </Paper>
    );
  }

  const maxHoras = Math.max(...motivos.map((m) => m.totalHoras));

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Distribuicao por Motivo
      </Typography>
      <Box sx={{ overflowX: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell width={50}>Cod</TableCell>
              <TableCell width={50}>Sigla</TableCell>
              <TableCell>Descricao</TableCell>
              <TableCell width={80} align="right">Horas</TableCell>
              <TableCell width={60} align="right">%</TableCell>
              <TableCell width={200}>Distribuicao</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {motivos.map((m, idx) => (
              <TableRow key={m.rdomotivocod} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight="bold" color="primary">
                    {m.rdomotivocod}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">
                    {m.sigla}
                  </Typography>
                </TableCell>
                <TableCell>{m.descricao}</TableCell>
                <TableCell align="right">
                  {m.totalHoras.toFixed(1)}
                </TableCell>
                <TableCell align="right">
                  <Typography
                    variant="body2"
                    fontWeight="bold"
                    color={idx === 0 ? 'primary' : 'text.primary'}
                  >
                    {m.percentualDoTotal.toFixed(1)}%
                  </Typography>
                </TableCell>
                <TableCell>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Box sx={{ flex: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={maxHoras > 0 ? (m.totalHoras / maxHoras) * 100 : 0}
                        sx={{
                          height: 10,
                          borderRadius: 5,
                          bgcolor: 'action.hover',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: barColors[idx % barColors.length],
                            borderRadius: 5,
                          },
                        }}
                      />
                    </Box>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Paper>
  );
}
