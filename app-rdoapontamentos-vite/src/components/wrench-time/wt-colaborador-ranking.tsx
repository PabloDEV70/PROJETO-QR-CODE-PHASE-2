import {
  Box,
  Chip,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { Link } from 'react-router-dom';
import type { ColaboradorWrenchTime } from '@/types/wrench-time-types';
import { getBenchmarkColor, fmtMin } from '@/utils/wrench-time-categories';

interface WtColaboradorRankingProps {
  colabs: ColaboradorWrenchTime[];
  isLoading?: boolean;
}

export function WtColaboradorRanking({ colabs, isLoading }: WtColaboradorRankingProps) {
  if (!isLoading && colabs.length === 0) {
    return (
      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Ranking de Colaboradores
        </Typography>
        <Stack alignItems="center" justifyContent="center" sx={{ height: 200 }}>
          <Typography variant="body2" color="text.secondary">
            Nenhum colaborador encontrado
          </Typography>
        </Stack>
      </Paper>
    );
  }

  if (isLoading) {
    return (
      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Ranking de Colaboradores
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell width={60}>#</TableCell>
                <TableCell>Nome</TableCell>
                <TableCell>Departamento</TableCell>
                <TableCell align="right">WT%</TableCell>
                <TableCell align="right">Horas</TableCell>
                <TableCell width={140}>Distribuicao</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.from({ length: 5 }).map((_, idx) => (
                <TableRow key={idx}>
                  <TableCell>
                    <Skeleton width={30} />
                  </TableCell>
                  <TableCell>
                    <Skeleton width={180} />
                  </TableCell>
                  <TableCell>
                    <Skeleton width={120} />
                  </TableCell>
                  <TableCell>
                    <Skeleton width={60} />
                  </TableCell>
                  <TableCell>
                    <Skeleton width={70} />
                  </TableCell>
                  <TableCell>
                    <Skeleton width={120} height={12} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
        Ranking de Colaboradores
      </Typography>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell width={60}>#</TableCell>
              <TableCell>Nome</TableCell>
              <TableCell>Departamento</TableCell>
              <TableCell align="right">WT%</TableCell>
              <TableCell align="right">Horas</TableCell>
              <TableCell width={140}>Distribuicao</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {colabs.map((colab, idx) => (
              <TableRow key={colab.codparc} hover>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {idx + 1}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Link
                    to={`/rdo/colaborador/${colab.codparc}`}
                    style={{ textDecoration: 'none' }}
                  >
                    <Typography variant="body2" color="primary" sx={{ fontWeight: 500 }}>
                      {colab.nomeparc}
                    </Typography>
                  </Link>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {colab.departamento || '-'}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Chip
                    label={`${colab.wrenchTimePercent}%`}
                    size="small"
                    sx={{
                      bgcolor: getBenchmarkColor(colab.benchmarkStatus),
                      color: 'white',
                      fontWeight: 600,
                      minWidth: 60,
                    }}
                  />
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2">{fmtMin(colab.totalMin)}</Typography>
                </TableCell>
                <TableCell>
                  <Stack
                    direction="row"
                    sx={{
                      width: 120,
                      height: 12,
                      borderRadius: 1,
                      overflow: 'hidden',
                      bgcolor: 'grey.200',
                    }}
                  >
                    {colab.categoryBreakdown
                      .filter((b) => b.totalMin > 0)
                      .map((b) => (
                        <Tooltip
                          key={b.category}
                          title={`${b.label}: ${fmtMin(b.totalMin)}`}
                          arrow
                        >
                          <Box
                            sx={{
                              width: `${b.percentOfTotal}%`,
                              height: '100%',
                              bgcolor: b.color,
                              minWidth: b.percentOfTotal > 0 ? 2 : 0,
                            }}
                          />
                        </Tooltip>
                      ))}
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
