import { useMemo } from 'react';
import {
  Box, Paper, Typography, Chip, CircularProgress, Alert, TextField,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Tooltip, LinearProgress,
} from '@mui/material';
import { OpenInNew } from '@mui/icons-material';
import { useQueriesAtivas } from '@/hooks/use-database-monitor';
import { useDebouncedParam } from '@/hooks/use-debounced-param';
import { useQueryDraftStore } from '@/stores/query-draft-store';
import { useSearchParams } from 'react-router-dom';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type R = Record<string, any>;

const SANKHYA_PROGRAMS = ['sankhyaw', 'jthinserver', 'mge', 'sankhya'];

function isSankhya(program: string, login: string): boolean {
  const p = (program || '').toLowerCase();
  const l = (login || '').toLowerCase();
  return SANKHYA_PROGRAMS.some((s) => p.includes(s) || l.includes(s));
}

const CELL = { fontSize: 11, py: 0.25 } as const;
const HEAD = { fontWeight: 700, fontSize: 11, py: 0.5 } as const;

export function MonitorLivePanel() {
  const { data, isLoading, error, isFetching } = useQueriesAtivas();
  const [search, setSearch] = useDebouncedParam('mql');
  const setDraft = useQueryDraftStore((s) => s.setDraft);
  const [, setParams] = useSearchParams();

  const queries = useMemo(() => {
    const list = (Array.isArray(data) ? data : []) as R[];
    if (!search) return list;
    const lower = search.toLowerCase();
    return list.filter((q) =>
      String(q.textoQuery ?? q.text ?? '').toLowerCase().includes(lower)
      || String(q.nomeBancoDados ?? q.database_name ?? '').toLowerCase().includes(lower),
    );
  }, [data, search]);

  const openInEditor = (sql: string) => {
    setDraft(sql);
    setParams((p) => {
      const n = new URLSearchParams(p);
      n.set('tab', 'query');
      n.delete('msub');
      n.delete('mql');
      return n;
    }, { replace: true });
  };

  if (error) return (
    <Alert severity="error" sx={{ py: 0, whiteSpace: 'pre-wrap', fontSize: 12 }}>
      Queries Ativas — {(error as Error).message}
    </Alert>
  );

  return (
    <Paper sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1, py: 0.5, flexShrink: 0 }}>
        <Typography sx={{ fontSize: 12, fontWeight: 700 }}>
          Queries Ativas ({queries.length})
        </Typography>
        <TextField
          size="small" placeholder="Filtrar query ou banco..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          sx={{ ml: 'auto', width: 220, '& input': { fontSize: 11, py: 0.5, px: 1 } }}
        />
        {isFetching && !isLoading && <CircularProgress size={14} />}
      </Box>
      {isLoading && <LinearProgress sx={{ flexShrink: 0 }} />}
      {queries.length === 0 && !isLoading ? (
        <Typography sx={{ fontSize: 12, color: 'text.secondary', px: 1, py: 2 }}>
          Nenhuma query ativa
        </Typography>
      ) : (
        <TableContainer sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={HEAD}>Session</TableCell>
                <TableCell sx={HEAD}>Status</TableCell>
                <TableCell sx={HEAD}>Login</TableCell>
                <TableCell sx={HEAD}>Banco</TableCell>
                <TableCell sx={HEAD} align="right">CPU (ms)</TableCell>
                <TableCell sx={HEAD} align="right">Duracao (ms)</TableCell>
                <TableCell sx={HEAD}>Wait</TableCell>
                <TableCell sx={HEAD}>Bloqueio</TableCell>
                <TableCell sx={HEAD}>Query</TableCell>
                <TableCell sx={{ ...HEAD, width: 36 }} />
              </TableRow>
            </TableHead>
            <TableBody>
              {queries.map((q, i) => {
                const sankhya = isSankhya(
                  q.nomePrograma ?? q.program_name ?? '',
                  q.nomeLogin ?? q.login_name ?? '',
                );
                const sqlText = String(q.textoQuery ?? q.text ?? '');
                return (
                  <TableRow
                    key={q.idSessao ?? q.session_id ?? i} hover
                    sx={sankhya ? { borderLeft: '3px solid #1976d2' } : undefined}
                  >
                    <TableCell sx={CELL}>{q.idSessao ?? q.session_id}</TableCell>
                    <TableCell sx={CELL}>
                      <Chip label={q.status} size="small" sx={{ height: 18, fontSize: 10 }} />
                    </TableCell>
                    <TableCell sx={CELL}>{q.nomeLogin ?? q.login_name}</TableCell>
                    <TableCell sx={CELL}>{q.nomeBancoDados ?? q.database_name}</TableCell>
                    <TableCell sx={CELL} align="right">
                      {(q.tempoCpu ?? q.cpu_time ?? 0).toLocaleString()}
                    </TableCell>
                    <TableCell sx={CELL} align="right">
                      {(q.tempoTotalDecorrido ?? q.total_elapsed_time ?? 0).toLocaleString()}
                    </TableCell>
                    <TableCell sx={CELL}>{q.tipoEspera ?? q.wait_type ?? '-'}</TableCell>
                    <TableCell sx={CELL}>
                      {q.idSessaoBloqueadora ?? q.blocking_session_id ?? '-'}
                    </TableCell>
                    <TableCell sx={{
                      ...CELL, maxWidth: 280, overflow: 'hidden',
                      textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {sqlText.substring(0, 120)}
                    </TableCell>
                    <TableCell sx={CELL}>
                      {sqlText.trim() && (
                        <Tooltip title="Abrir no Editor">
                          <IconButton size="small" onClick={() => openInEditor(sqlText)}>
                            <OpenInNew sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Tooltip>
                      )}
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
