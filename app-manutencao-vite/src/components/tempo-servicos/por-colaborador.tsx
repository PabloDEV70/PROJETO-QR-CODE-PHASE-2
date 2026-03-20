import {
  Box, Paper, Typography, Skeleton, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material';
import { Business, Badge } from '@mui/icons-material';
import { FuncionarioCombobox } from '@/components/shared/funcionario-combobox';
import { FuncionarioAvatar } from '@/components/shared/funcionario-avatar';
import type { TempoServicosResponse } from '@/types/os-types';

interface PorColaboradorProps {
  data: TempoServicosResponse | undefined;
  loading: boolean;
  codexec: number | null;
  onCodexecChange: (val: number | null) => void;
}

const chipSx = {
  height: 18, fontSize: 10, fontWeight: 500, borderRadius: 1,
  '& .MuiChip-label': { px: 0.5 },
  '& .MuiChip-icon': { ml: 0.25 },
};

export function TempoPorColaborador({ data, loading, codexec, onCodexecChange }: PorColaboradorProps) {
  const executores = [...(data?.porExecutor ?? [])]
    .sort((a, b) => b.totalServicos - a.totalServicos);

  return (
    <Box>
      <Box sx={{ maxWidth: 400, mb: 3 }}>
        <FuncionarioCombobox
          value={codexec}
          onChange={(val) => onCodexecChange(val)}
          label="Filtrar por Executor"
          placeholder="Buscar executor..."
        />
      </Box>

      {loading ? (
        <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 1 }} />
      ) : (
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Ranking de Executores ({executores.length})
          </Typography>
          <TableContainer sx={{ maxHeight: 600 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Executor</TableCell>
                  <TableCell align="right">Servicos</TableCell>
                  <TableCell align="right">Concluidos</TableCell>
                  <TableCell align="right">Media (min)</TableCell>
                  <TableCell align="right">Total (h)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {executores.map((row, idx) => {
                  const isSelected = codexec === row.codusu;
                  return (
                    <TableRow
                      key={row.codusu}
                      sx={{
                        bgcolor: isSelected ? 'action.selected' : 'inherit',
                        '&:hover': { bgcolor: 'action.hover' },
                      }}
                    >
                      <TableCell sx={{ fontWeight: 600, color: 'text.secondary', width: 40 }}>
                        {idx + 1}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <FuncionarioAvatar
                            codparc={row.codparc ?? 0}
                            codemp={row.codemp ?? undefined}
                            codfunc={row.codfunc ?? undefined}
                            nome={row.nomeExecutor}
                            size="small"
                            sx={{ width: 36, height: 36, flexShrink: 0 }}
                          />
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="body2" fontWeight={isSelected ? 700 : 600} noWrap>
                              {row.nomeExecutor}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 0.5, mt: 0.25, flexWrap: 'wrap' }}>
                              {row.departamento && (
                                <Chip
                                  icon={<Business sx={{ fontSize: '12px !important' }} />}
                                  label={row.departamento}
                                  size="small"
                                  variant="outlined"
                                  sx={chipSx}
                                />
                              )}
                              {row.cargo && (
                                <Chip
                                  icon={<Badge sx={{ fontSize: '12px !important' }} />}
                                  label={row.cargo}
                                  size="small"
                                  variant="outlined"
                                  sx={chipSx}
                                />
                              )}
                            </Box>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell align="right">{row.totalServicos}</TableCell>
                      <TableCell align="right">{row.servicosConcluidos}</TableCell>
                      <TableCell align="right">
                        {row.mediaMinutos > 0 ? row.mediaMinutos.toFixed(0) : '-'}
                      </TableCell>
                      <TableCell align="right">
                        {row.totalMinutos > 0 ? (row.totalMinutos / 60).toFixed(1) : '-'}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {executores.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography color="text.secondary" variant="body2">
                        Sem dados de executores
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Box>
  );
}
