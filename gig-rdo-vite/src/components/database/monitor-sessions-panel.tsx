import { useMemo } from 'react';
import {
  Box, Paper, Typography, Chip, CircularProgress, Alert, TextField,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  LinearProgress,
} from '@mui/material';
import { useSessoes } from '@/hooks/use-database-monitor';
import { useDebouncedParam } from '@/hooks/use-debounced-param';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type R = Record<string, any>;

const SANKHYA_PROGRAMS = ['sankhyaw', 'jthinserver', 'mge', 'sankhya'];

function isSankhya(program: string): boolean {
  const p = (program || '').toLowerCase();
  return SANKHYA_PROGRAMS.some((s) => p.includes(s));
}

const STATUS_COLOR: Record<string, 'success' | 'default' | 'warning' | 'error'> = {
  running: 'success',
  sleeping: 'default',
  dormant: 'default',
  preconnect: 'warning',
  suspended: 'warning',
};

const CELL = { fontSize: 11, py: 0.25 } as const;
const HEAD = { fontWeight: 700, fontSize: 11, py: 0.5 } as const;

export function MonitorSessionsPanel() {
  const { data, isLoading, error, isFetching } = useSessoes();
  const [search, setSearch] = useDebouncedParam('ms');

  const sessions = useMemo(() => {
    const list = (Array.isArray(data) ? data : []) as R[];
    if (!search) return list;
    const lower = search.toLowerCase();
    return list.filter((s) =>
      String(s.nomeLogin ?? s.login_name ?? '').toLowerCase().includes(lower)
      || String(s.nomePrograma ?? s.program_name ?? '').toLowerCase().includes(lower)
      || String(s.nomeHost ?? s.host_name ?? '').toLowerCase().includes(lower),
    );
  }, [data, search]);

  if (error) return (
    <Alert severity="error" sx={{ py: 0, whiteSpace: 'pre-wrap', fontSize: 12 }}>
      Sessoes — {(error as Error).message}
    </Alert>
  );

  return (
    <Paper sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1, py: 0.5, flexShrink: 0 }}>
        <Typography sx={{ fontSize: 12, fontWeight: 700 }}>
          Sessoes ({sessions.length})
        </Typography>
        <TextField
          size="small" placeholder="Filtrar login, host ou programa..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          sx={{ ml: 'auto', width: 240, '& input': { fontSize: 11, py: 0.5, px: 1 } }}
        />
        {isFetching && !isLoading && <CircularProgress size={14} />}
      </Box>
      {isLoading && <LinearProgress sx={{ flexShrink: 0 }} />}
      {sessions.length === 0 && !isLoading ? (
        <Typography sx={{ fontSize: 12, color: 'text.secondary', px: 1, py: 2 }}>
          Nenhuma sessao ativa
        </Typography>
      ) : (
        <TableContainer sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={HEAD}>ID</TableCell>
                <TableCell sx={HEAD}>Login</TableCell>
                <TableCell sx={HEAD}>Host</TableCell>
                <TableCell sx={HEAD}>Programa</TableCell>
                <TableCell sx={HEAD}>Status</TableCell>
                <TableCell sx={HEAD} align="right">CPU (ms)</TableCell>
                <TableCell sx={HEAD}>Login Time</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sessions.map((s) => {
                const program = String(s.nomePrograma ?? s.program_name ?? '');
                const sankhya = isSankhya(program);
                const status = String(s.status ?? '').toLowerCase();
                const chipColor = STATUS_COLOR[status] ?? 'default';
                return (
                  <TableRow
                    key={s.idSessao ?? s.session_id} hover
                    sx={sankhya ? { borderLeft: '3px solid #1976d2' } : undefined}
                  >
                    <TableCell sx={CELL}>{s.idSessao ?? s.session_id}</TableCell>
                    <TableCell sx={CELL}>{s.nomeLogin ?? s.login_name}</TableCell>
                    <TableCell sx={CELL}>{s.nomeHost ?? s.host_name}</TableCell>
                    <TableCell sx={CELL}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {program}
                        {sankhya && (
                          <Chip
                            label="Sankhya" size="small"
                            sx={{
                              height: 16, fontSize: 9, fontWeight: 700,
                              bgcolor: '#1976d220', color: '#1976d2',
                            }}
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell sx={CELL}>
                      <Chip
                        label={s.status} size="small" color={chipColor}
                        sx={{ height: 18, fontSize: 10 }}
                      />
                    </TableCell>
                    <TableCell sx={CELL} align="right">
                      {(s.tempoCpu ?? s.cpu_time ?? 0).toLocaleString()}
                    </TableCell>
                    <TableCell sx={CELL}>
                      {(s.horaLogin ?? s.login_time)
                        ? new Date(s.horaLogin ?? s.login_time).toLocaleString('pt-BR')
                        : '-'}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
}
