import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Skeleton,
} from '@mui/material';
import type { HoraExtraPorDepartamento } from '@/types/rdo-analytics-types';

interface HoraExtraTableProps {
  data?: HoraExtraPorDepartamento[];
  isLoading: boolean;
}

function fmtHrs(min: number): string {
  return `${(min / 60).toFixed(1)}h`;
}

export function HoraExtraTable({ data, isLoading }: HoraExtraTableProps) {
  if (isLoading) {
    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Departamento</TableCell>
              <TableCell align="right">Total HE</TableCell>
              <TableCell align="right">Colaboradores</TableCell>
              <TableCell align="right">Média/Colab</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[1, 2, 3].map((i) => (
              <TableRow key={i}>
                <TableCell><Skeleton /></TableCell>
                <TableCell><Skeleton /></TableCell>
                <TableCell><Skeleton /></TableCell>
                <TableCell><Skeleton /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Sem dados de hora extra para o periodo
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Departamento</TableCell>
            <TableCell align="right">Total HE</TableCell>
            <TableCell align="right">Colaboradores</TableCell>
            <TableCell align="right">Média/Colab</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, idx) => (
            <TableRow key={row.coddep ?? `null-${idx}`}>
              <TableCell>
                {row.departamento ?? 'Sem depto'}
              </TableCell>
              <TableCell align="right">
                <Typography variant="body2" fontWeight="bold">
                  {fmtHrs(row.totalHoraExtraMin)}
                </Typography>
              </TableCell>
              <TableCell align="right">
                {row.totalColaboradores}
              </TableCell>
              <TableCell align="right">
                {fmtHrs(row.mediaHoraExtraMinPorColab)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
