import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Skeleton,
  Typography,
  Box,
} from '@mui/material';
import type { RdoAnalyticsEficiencia } from '@/types/rdo-analytics-types';

interface EficienciaTableProps {
  data?: RdoAnalyticsEficiencia[];
  isLoading: boolean;
}

export const EficienciaTable = ({ data, isLoading }: EficienciaTableProps) => {
  const getPercentualChipColor = (percentual: number) => {
    if (percentual < 30) return 'success';
    if (percentual < 50) return 'warning';
    return 'error';
  };

  if (isLoading) {
    return (
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell width="5%">#</TableCell>
              <TableCell width="30%">Colaborador</TableCell>
              <TableCell width="15%" align="right">Itens</TableCell>
              <TableCell width="20%" align="right">Média min/item</TableCell>
              <TableCell width="15%" align="center">% Curtos</TableCell>
              <TableCell width="15%" align="right">Motivos</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell><Skeleton width={20} /></TableCell>
                <TableCell><Skeleton /></TableCell>
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
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Sem dados de eficiência para o período selecionado
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell width="5%">#</TableCell>
            <TableCell width="30%">Colaborador</TableCell>
            <TableCell width="15%" align="right">Itens</TableCell>
            <TableCell width="20%" align="right">Média min/item</TableCell>
            <TableCell width="15%" align="center">% Curtos</TableCell>
            <TableCell width="15%" align="right">Motivos</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, index) => {
            const isTopThree = index < 3;

            return (
              <TableRow key={row.codparc} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight={isTopThree ? 600 : 400}>
                    {index + 1}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={isTopThree ? 600 : 400}>
                    {row.nomeparc}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2">
                    {row.totalItens.toLocaleString('pt-BR')}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" fontWeight={600}>
                    {row.mediaMinutosPorItem.toFixed(1)}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={`${row.percentualCurtos.toFixed(0)}%`}
                    color={getPercentualChipColor(row.percentualCurtos)}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2">
                    {row.motivosDiferentes}
                  </Typography>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
