import {
  Box, Paper, Typography, Skeleton, MenuItem, TextField,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import type { TempoServicosResponse } from '@/types/os-types';

interface PorGrupoProps {
  data: TempoServicosResponse | undefined;
  loading: boolean;
  codGrupoProd: number | null;
  onGrupoChange: (val: number | null) => void;
}

export function TempoPorGrupo({ data, loading, codGrupoProd, onGrupoChange }: PorGrupoProps) {
  const grupos = data?.porGrupo ?? [];
  const topServicos = (data?.topServicos ?? []).slice(0, 30);

  const barData = [...grupos]
    .sort((a, b) => b.mediaHoras - a.mediaHoras)
    .map((g) => ({ name: g.descrGrupo, horas: g.mediaHoras }));

  return (
    <Box>
      <Box sx={{ maxWidth: 300, mb: 3 }}>
        <TextField
          select
          size="small"
          fullWidth
          label="Grupo de Servico"
          value={codGrupoProd ?? ''}
          onChange={(e) => onGrupoChange(e.target.value ? Number(e.target.value) : null)}
        >
          <MenuItem value="">Todos Grupos</MenuItem>
          {grupos.map((g) => (
            <MenuItem key={g.codGrupoProd} value={g.codGrupoProd}>
              {g.descrGrupo} ({g.totalServicos})
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {loading ? (
        <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 1 }} />
      ) : (
        <>
          {/* Bar chart */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Media Horas por Grupo
            </Typography>
            {barData.length === 0 ? (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 240 }}>
                <Typography color="text.secondary" variant="body2">Sem dados</Typography>
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height={Math.max(240, barData.length * 36)}>
                <BarChart data={barData} layout="vertical" margin={{ left: 8, right: 16 }}>
                  <XAxis type="number" tick={{ fontSize: 11 }} unit="h" />
                  <YAxis type="category" dataKey="name" width={160} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(val) => [`${val}h`, 'Media']} />
                  <Bar dataKey="horas" fill="#2e7d32" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Paper>

          {/* Top servicos table */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Top 30 Servicos Mais Lentos
            </Typography>
            <TableContainer sx={{ maxHeight: 400 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Servico</TableCell>
                    <TableCell align="right">Execucoes</TableCell>
                    <TableCell align="right">Media (h)</TableCell>
                    <TableCell align="right">Min (h)</TableCell>
                    <TableCell align="right">Max (h)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {topServicos.map((row) => (
                    <TableRow key={row.codProd}>
                      <TableCell>
                        <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>
                          {row.descrProd}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">{row.totalExecucoes}</TableCell>
                      <TableCell align="right">{row.mediaHoras}</TableCell>
                      <TableCell align="right">{row.minHoras}</TableCell>
                      <TableCell align="right">{row.maxHoras}</TableCell>
                    </TableRow>
                  ))}
                  {topServicos.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Typography color="text.secondary" variant="body2">
                          Sem dados de servicos
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </>
      )}
    </Box>
  );
}
