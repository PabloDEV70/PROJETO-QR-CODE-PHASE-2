import { useMemo, useState } from 'react';
import {
  Box, Paper, Typography, CircularProgress, Alert, TextField,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Tooltip, TableSortLabel, LinearProgress,
} from '@mui/material';
import { OpenInNew } from '@mui/icons-material';
import { useEstatisticasQuery } from '@/hooks/use-database-monitor';
import { useDebouncedParam } from '@/hooks/use-debounced-param';
import { useQueryDraftStore } from '@/stores/query-draft-store';
import { useSearchParams } from 'react-router-dom';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type R = Record<string, any>;
type SortDir = 'asc' | 'desc';

const CELL = { fontSize: 11, py: 0.25 } as const;
const HEAD = { fontWeight: 700, fontSize: 11, py: 0.5 } as const;

const COLS = [
  { id: 'query_text', label: 'Query', align: 'left' as const, numeric: false },
  { id: 'execution_count', label: 'Execucoes', align: 'right' as const, numeric: true },
  { id: 'avg_worker_time', label: 'CPU Med (ms)', align: 'right' as const, numeric: true },
  { id: 'avg_elapsed_time', label: 'Duracao Med (ms)', align: 'right' as const, numeric: true },
  { id: 'total_logical_reads', label: 'Reads Total', align: 'right' as const, numeric: true },
  { id: 'last_execution_time', label: 'Ultima Exec', align: 'left' as const, numeric: false },
] as const;

type ColId = (typeof COLS)[number]['id'];

function num(v: unknown): number {
  return typeof v === 'number' ? v : Number(v) || 0;
}

function fmtNum(v: unknown): string {
  return num(v).toLocaleString();
}

function fmtMs(v: unknown): string {
  const n = num(v);
  return n > 1000 ? `${(n / 1000).toFixed(1)}ms` : `${Math.round(n / 1000)}ms`;
}

export function MonitorHistoryPanel() {
  const { data, isLoading, error, isFetching } = useEstatisticasQuery({ limite: 200 });
  const [search, setSearch] = useDebouncedParam('mq');
  const [sortCol, setSortCol] = useState<ColId>('execution_count');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const setDraft = useQueryDraftStore((s) => s.setDraft);
  const [, setParams] = useSearchParams();

  const handleSort = (col: ColId) => {
    setSortDir(sortCol === col && sortDir === 'desc' ? 'asc' : 'desc');
    setSortCol(col);
  };

  const rows = useMemo(() => {
    let list = (Array.isArray(data) ? data : []) as R[];
    if (search) {
      const lower = search.toLowerCase();
      list = list.filter((q) =>
        String(q.textoQuery ?? q.query_text ?? '').toLowerCase().includes(lower),
      );
    }
    const colDef = COLS.find((c) => c.id === sortCol);
    list = [...list].sort((a, b) => {
      const av = a[sortCol] ?? a.textoQuery ?? '';
      const bv = b[sortCol] ?? b.textoQuery ?? '';
      const cmp = colDef?.numeric ? num(av) - num(bv) : String(av).localeCompare(String(bv));
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [data, search, sortCol, sortDir]);

  const openInEditor = (sql: string) => {
    setDraft(sql);
    setParams((p) => {
      const n = new URLSearchParams(p);
      n.set('tab', 'query');
      n.delete('msub');
      n.delete('mq');
      return n;
    }, { replace: true });
  };

  if (error) return (
    <Alert severity="error" sx={{ py: 0, whiteSpace: 'pre-wrap', fontSize: 12 }}>
      Estatisticas — {(error as Error).message}
    </Alert>
  );

  return (
    <Paper sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1, py: 0.5, flexShrink: 0 }}>
        <Typography sx={{ fontSize: 12, fontWeight: 700 }}>
          Plan Cache ({rows.length})
        </Typography>
        <TextField
          size="small" placeholder="Filtrar query..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          sx={{ ml: 'auto', width: 220, '& input': { fontSize: 11, py: 0.5, px: 1 } }}
        />
        {isFetching && !isLoading && <CircularProgress size={14} />}
      </Box>
      {isLoading && <LinearProgress sx={{ flexShrink: 0 }} />}
      {rows.length === 0 && !isLoading ? (
        <Typography sx={{ fontSize: 12, color: 'text.secondary', px: 1, py: 2 }}>
          Nenhuma estatistica disponivel
        </Typography>
      ) : (
        <TableContainer sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                {COLS.map((col) => (
                  <TableCell key={col.id} align={col.align} sx={HEAD}>
                    <TableSortLabel
                      active={sortCol === col.id} direction={sortCol === col.id ? sortDir : 'asc'}
                      onClick={() => handleSort(col.id)}
                      sx={{ '& .MuiTableSortLabel-icon': { fontSize: 12 } }}
                    >
                      {col.label}
                    </TableSortLabel>
                  </TableCell>
                ))}
                <TableCell sx={{ ...HEAD, width: 36 }} />
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((q, i) => {
                const sqlText = String(q.textoQuery ?? q.query_text ?? '');
                return (
                  <TableRow key={q.query_hash ?? i} hover>
                    <TableCell sx={{
                      ...CELL, maxWidth: 300, overflow: 'hidden',
                      textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {sqlText.substring(0, 120)}
                    </TableCell>
                    <TableCell sx={CELL} align="right">
                      {fmtNum(q.contagemExecucoes ?? q.execution_count)}
                    </TableCell>
                    <TableCell sx={CELL} align="right">
                      {fmtMs(q.cpuMedioMs ?? q.avg_worker_time)}
                    </TableCell>
                    <TableCell sx={CELL} align="right">
                      {fmtMs(q.duracaoMediaMs ?? q.avg_elapsed_time)}
                    </TableCell>
                    <TableCell sx={CELL} align="right">
                      {fmtNum(q.leiturasLogicasTotais ?? q.total_logical_reads)}
                    </TableCell>
                    <TableCell sx={CELL}>
                      {q.last_execution_time
                        ? new Date(q.last_execution_time).toLocaleString('pt-BR')
                        : '-'}
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
