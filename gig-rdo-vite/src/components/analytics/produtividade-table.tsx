import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Box,
  Skeleton,
} from '@mui/material';
import type { RdoAnalyticsProdutividade } from '@/types/rdo-analytics-types';

interface ProdutividadeTableProps {
  data?: RdoAnalyticsProdutividade[];
  isLoading: boolean;
}

export function ProdutividadeTable({ data, isLoading }: ProdutividadeTableProps) {
  if (isLoading) {
    return (
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell width="5%">#</TableCell>
            <TableCell width="25%">Colaborador</TableCell>
            <TableCell align="right" width="10%">RDOs</TableCell>
            <TableCell align="right" width="10%">Horas</TableCell>
            <TableCell align="right" width="15%">Média h/RDO</TableCell>
            <TableCell align="right" width="10%">Itens</TableCell>
            <TableCell align="center" width="12%">% Curtos</TableCell>
            <TableCell align="center" width="13%">% com OS</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Array.from({ length: 5 }).map((_, idx) => (
            <TableRow key={idx}>
              <TableCell><Skeleton width={20} /></TableCell>
              <TableCell><Skeleton width="80%" /></TableCell>
              <TableCell><Skeleton width={40} /></TableCell>
              <TableCell><Skeleton width={50} /></TableCell>
              <TableCell><Skeleton width={60} /></TableCell>
              <TableCell><Skeleton width={40} /></TableCell>
              <TableCell><Skeleton width={60} /></TableCell>
              <TableCell><Skeleton width={60} /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" py={8}>
        <Typography color="text.secondary">Sem dados</Typography>
      </Box>
    );
  }

  const getPercentualCurtosColor = (percentual: number): 'success' | 'warning' | 'error' => {
    if (percentual < 30) return 'success';
    if (percentual < 50) return 'warning';
    return 'error';
  };

  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell width="5%">#</TableCell>
          <TableCell width="25%">Colaborador</TableCell>
          <TableCell align="right" width="10%">RDOs</TableCell>
          <TableCell align="right" width="10%">Horas</TableCell>
          <TableCell align="right" width="15%">Média h/RDO</TableCell>
          <TableCell align="right" width="10%">Itens</TableCell>
          <TableCell align="center" width="12%">% Curtos</TableCell>
          <TableCell align="center" width="13%">% com OS</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {data.map((row, idx) => (
          <TableRow key={row.codparc} hover>
            <TableCell>
              <Typography variant="body2" color="text.secondary">
                {idx + 1}
              </Typography>
            </TableCell>
            <TableCell>
              <Typography
                variant="body2"
                fontWeight={idx < 3 ? 600 : 400}
              >
                {row.nomeparc}
              </Typography>
            </TableCell>
            <TableCell align="right">
              <Typography variant="body2">{row.totalRdos}</Typography>
            </TableCell>
            <TableCell align="right">
              <Typography variant="body2">{row.totalHoras.toFixed(1)}</Typography>
            </TableCell>
            <TableCell align="right">
              <Typography variant="body2">{row.mediaHorasPorRdo.toFixed(2)}</Typography>
            </TableCell>
            <TableCell align="right">
              <Typography variant="body2">{row.totalItens}</Typography>
            </TableCell>
            <TableCell align="center">
              <Chip
                label={`${row.percentualCurtos.toFixed(1)}%`}
                color={getPercentualCurtosColor(row.percentualCurtos)}
                variant="outlined"
                size="small"
              />
            </TableCell>
            <TableCell align="center">
              <Typography variant="body2">
                {row.percentualComOs.toFixed(1)}%
              </Typography>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
