import {
  Box, Paper, Typography, TextField, CircularProgress, Alert, Chip, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import { useAuditHistorico, useAuditEstatisticas } from '@/hooks/use-database-objects';

export function AuditTab() {
  const [params, setParams] = useSearchParams();
  const tabela = params.get('at') || '';
  const page = Number(params.get('ap')) || 1;

  const setTabela = (v: string) => {
    setParams((p) => {
      const n = new URLSearchParams(p);
      v ? n.set('at', v) : n.delete('at');
      n.delete('ap');
      return n;
    }, { replace: true });
  };

  const setPage = (v: number) => {
    setParams((p) => {
      const n = new URLSearchParams(p);
      v > 1 ? n.set('ap', String(v)) : n.delete('ap');
      return n;
    }, { replace: true });
  };

  const { data: historico, isLoading, error } = useAuditHistorico({
    tabela: tabela || undefined,
    page,
    limit: 50,
  });
  const { data: stats } = useAuditEstatisticas({ tabela: tabela || undefined });

  const records = historico?.data ?? [];
  const meta = historico?.meta;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, height: '100%' }}>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexShrink: 0 }}>
        <TextField
          size="small" placeholder="Filtrar tabela..."
          value={tabela} onChange={(e) => setTabela(e.target.value)}
          sx={{ width: 220 }}
          slotProps={{ input: { sx: { fontSize: 12 } } }}
        />
        {stats && (
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            <Chip label={`${stats.totalRegistros} total`} size="small" variant="outlined"
              sx={{ height: 20, fontSize: 10 }} />
            {stats.porOperacao && Object.entries(stats.porOperacao).map(([op, count]) => (
              <Chip key={op} label={`${op}: ${count}`} size="small" variant="outlined"
                sx={{ height: 20, fontSize: 10 }} />
            ))}
          </Box>
        )}
        {meta && (
          <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto', fontSize: 11 }}>
            {meta.page}/{meta.totalPages} ({meta.total})
          </Typography>
        )}
      </Box>

      {isLoading && <CircularProgress size={20} />}
      {error && <Alert severity="warning" sx={{ py: 0 }}>Auditoria indisponivel</Alert>}

      {!isLoading && !error && (
        <Paper sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          <TableContainer sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, fontSize: 11, py: 0.5 }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 11, py: 0.5 }}>Tabela</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 11, py: 0.5 }}>Acao</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 11, py: 0.5 }}>Usuario</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 11, py: 0.5 }}>Data/Hora</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {records.map((r) => (
                  <TableRow key={r.ID} hover>
                    <TableCell sx={{ fontSize: 11, py: 0.25 }}>{r.ID}</TableCell>
                    <TableCell sx={{ fontSize: 11, py: 0.25, fontFamily: 'monospace' }}>
                      {r.TABELA}
                    </TableCell>
                    <TableCell sx={{ fontSize: 11, py: 0.25 }}>
                      <Chip label={r.ACAO} size="small" sx={{ height: 18, fontSize: 10 }}
                        color={r.ACAO === 'INSERT' ? 'success'
                          : r.ACAO === 'DELETE' ? 'error' : 'warning'}
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: 11, py: 0.25 }}>{r.NOMEUSU}</TableCell>
                    <TableCell sx={{ fontSize: 11, py: 0.25 }}>
                      {r.DTCREATED ? new Date(r.DTCREATED).toLocaleString('pt-BR') : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {meta && meta.totalPages > 1 && (
            <Box sx={{ display: 'flex', gap: 1, p: 0.5, justifyContent: 'center',
              borderTop: 1, borderColor: 'divider', flexShrink: 0 }}>
              <Button size="small" disabled={page <= 1}
                onClick={() => setPage(page - 1)} sx={{ fontSize: 11 }}>
                Anterior
              </Button>
              <Button size="small" disabled={page >= meta.totalPages}
                onClick={() => setPage(page + 1)} sx={{ fontSize: 11 }}>
                Proxima
              </Button>
            </Box>
          )}
        </Paper>
      )}
    </Box>
  );
}
