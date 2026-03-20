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
import type { AssiduidadePorColaborador } from '@/types/rdo-analytics-types';

interface AssiduidadeTableProps {
  data?: AssiduidadePorColaborador[];
  isLoading: boolean;
}

function getCumprColor(pct: number): 'success' | 'warning' | 'error' {
  if (pct >= 80) return 'success';
  if (pct >= 50) return 'warning';
  return 'error';
}

export function AssiduidadeTable({ data, isLoading }: AssiduidadeTableProps) {
  if (isLoading) {
    return (
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Colaborador</TableCell>
              <TableCell align="right">Dias</TableCell>
              <TableCell align="right">% Cumpr.</TableCell>
              <TableCell align="right">Atraso</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.from({ length: 5 }).map((_, idx) => (
              <TableRow key={idx}>
                <TableCell><Skeleton width={20} /></TableCell>
                <TableCell><Skeleton width={150} /></TableCell>
                <TableCell align="right"><Skeleton width={40} /></TableCell>
                <TableCell align="right"><Skeleton width={60} /></TableCell>
                <TableCell align="right"><Skeleton width={50} /></TableCell>
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
          Sem dados de assiduidade para o periodo
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>#</TableCell>
            <TableCell>Colaborador</TableCell>
            <TableCell align="right">Dias</TableCell>
            <TableCell align="right">% Cumpr.</TableCell>
            <TableCell align="right">Atraso</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, idx) => (
            <TableRow key={row.codparc} hover>
              <TableCell>{idx + 1}</TableCell>
              <TableCell>
                <Typography
                  variant="body2"
                  fontWeight={idx < 3 ? 700 : 400}
                >
                  {row.nomeparc}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="body2">
                  {row.diasCumpriuJornada}/{row.totalDias}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Chip
                  label={`${row.percentCumprimento.toFixed(0)}%`}
                  color={getCumprColor(row.percentCumprimento)}
                  variant="outlined"
                  size="small"
                />
              </TableCell>
              <TableCell align="right">
                <Typography variant="body2" color="text.secondary">
                  {Math.round(row.mediaAtrasoMin)}min
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
