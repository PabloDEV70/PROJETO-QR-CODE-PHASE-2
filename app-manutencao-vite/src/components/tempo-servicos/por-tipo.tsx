import {
  Box, Paper, Typography, Skeleton,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Stack, Chip,
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { TIPO_MANUT_MAP } from '@/utils/os-constants';
import type { TempoServicosResponse } from '@/types/os-types';

interface PorTipoProps {
  data: TempoServicosResponse | undefined;
  loading: boolean;
}

export function TempoPorTipo({ data, loading }: PorTipoProps) {
  const porTipo = data?.porTipo ?? [];

  const barData = porTipo
    .filter((t) => t.mediaHoras > 0)
    .map((t) => ({
      name: t.label,
      horas: t.mediaHoras,
      color: TIPO_MANUT_MAP[t.manutencao]?.color ?? '#9e9e9e',
    }));

  const nuncaExecTipos = porTipo.filter((t) => t.nuncaExecutados > 0);

  return loading ? (
    <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 1 }} />
  ) : (
    <Box>
      {/* Horizontal bar chart */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Media Horas por Tipo de Manutencao
        </Typography>
        {barData.length === 0 ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 240 }}>
            <Typography color="text.secondary" variant="body2">Sem dados</Typography>
          </Box>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={barData} layout="vertical" margin={{ left: 8, right: 16 }}>
              <XAxis type="number" tick={{ fontSize: 11 }} unit="h" />
              <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(val) => [`${val}h`, 'Media']} />
              <Bar dataKey="horas" radius={4}>
                {barData.map((entry, i) => (
                  <Cell key={`cell-${i}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </Paper>

      {/* Detail table */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Detalhamento por Tipo de Manutencao
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Tipo</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell align="right">Validos</TableCell>
                <TableCell align="right">Nunca Exec.</TableCell>
                <TableCell align="right">Media (h)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {porTipo.map((row) => (
                <TableRow key={row.manutencao}>
                  <TableCell>{row.label}</TableCell>
                  <TableCell align="right">{row.total.toLocaleString('pt-BR')}</TableCell>
                  <TableCell align="right">{row.validos.toLocaleString('pt-BR')}</TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      color: row.nuncaExecutados > 0 ? 'error.main' : 'inherit',
                      fontWeight: row.nuncaExecutados > 0 ? 700 : 400,
                    }}
                  >
                    {row.nuncaExecutados.toLocaleString('pt-BR')}
                  </TableCell>
                  <TableCell align="right">{row.mediaHoras}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Nunca executados summary */}
      {nuncaExecTipos.length > 0 && (
        <Paper sx={{ p: 2, bgcolor: 'error.50' }}>
          <Typography variant="subtitle2" color="error" gutterBottom>
            Servicos Nunca Executados por Tipo
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {nuncaExecTipos.map((t) => (
              <Chip
                key={t.manutencao}
                label={`${t.label}: ${t.nuncaExecutados}`}
                size="small"
                color="error"
                variant="outlined"
              />
            ))}
          </Stack>
        </Paper>
      )}
    </Box>
  );
}
