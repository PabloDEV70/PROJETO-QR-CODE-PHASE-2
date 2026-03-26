import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box, Paper, Typography, TextField, List, ListItemButton, ListItemText,
  Chip, Drawer, IconButton, Skeleton, Divider, InputAdornment, Alert,
} from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { Close, Search, Circle } from '@mui/icons-material';
import { ProdutoThumb } from '@/components/shared/produto-thumb';
import { FuncionarioAvatar } from '@/components/shared/funcionario-avatar';
import {
  useProdutosComSeries, useSeriesPorProduto,
  useHistoricoSerie, useBuscarSerie,
} from '@/hooks/use-series';
import type { SerieAtual, SerieHistorico } from '@/types/series-types';

const TIPMOV_COLORS: Record<string, string> = {
  T: '#1976d2', Q: '#ed6c02', L: '#2e7d32', C: '#7b1fa2',
  V: '#d32f2f', E: '#0288d1',
};

function toDateSafe(v: unknown): Date | null {
  if (v == null) return null;
  if (v instanceof Date) return isNaN(v.getTime()) ? null : v;
  if (typeof v === 'string' || typeof v === 'number') {
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
  }
  // Handle {value: "..."} or {date: "..."} objects from API
  if (typeof v === 'object') {
    const obj = v as Record<string, unknown>;
    const raw = obj.value ?? obj.date ?? obj.Date ?? obj.DTNEG ?? Object.values(obj)[0];
    if (raw != null) return toDateSafe(raw);
  }
  return null;
}

function fmtDate(v: unknown): string {
  const d = toDateSafe(v);
  if (!d) return '-';
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function fmtDateShort(v: unknown): string {
  const d = toDateSafe(v);
  if (!d) return '-';
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

const columns: GridColDef<SerieAtual>[] = [
  { field: 'SERIE', headerName: 'Serie', width: 180,
    renderCell: (p) => <Typography sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 13 }}>{p.value}</Typography>,
  },
  { field: 'COM_QUEM', headerName: 'Com quem', flex: 1, minWidth: 180 },
  { field: 'LOCAL_ATUAL', headerName: 'Local atual', width: 160 },
  { field: 'ULTIMA_MOVIMENTACAO', headerName: 'Ultima mov.', width: 160,
    renderCell: ({ value }) => <Typography sx={{ fontSize: 12.5 }}>{fmtDate(value)}</Typography>,
  },
  { field: 'DESCROPER', headerName: 'Operacao', width: 160 },
  { field: 'AVARIADO', headerName: 'Avariado', width: 100, align: 'center', headerAlign: 'center',
    renderCell: (p) => p.value === 'S' ? <Chip label="Sim" size="small" color="error" sx={{ fontWeight: 600, fontSize: 10 }} /> : null,
  },
];

function TimelineItem({ item, isLast }: { item: SerieHistorico; isLast: boolean }) {
  const color = TIPMOV_COLORS[item.TIPMOV] || '#757575';

  return (
    <Box sx={{ display: 'flex', gap: 0, mb: isLast ? 0 : 0.5 }}>
      {/* Left: timeline rail */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 28, flexShrink: 0 }}>
        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: color, flexShrink: 0, mt: 1.5 }} />
        {!isLast && <Box sx={{ width: 1.5, flex: 1, bgcolor: 'divider' }} />}
      </Box>

      {/* Right: card */}
      <Box sx={{ flex: 1, pb: isLast ? 0 : 1, pl: 1 }}>
        <Box sx={{
          border: '1px solid', borderColor: 'divider', borderRadius: 1.5,
          overflow: 'hidden',
        }}>
          {/* Date + operation header */}
          <Box sx={{ px: 1.5, py: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: (t) => t.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)' }}>
            <Typography sx={{ fontSize: 13, fontWeight: 700, color }}>{item.DESCROPER}</Typography>
            <Typography sx={{ fontSize: 11, color: 'text.secondary', fontFamily: 'monospace', flexShrink: 0, ml: 1 }}>
              {fmtDate(item.DTNEG)}
            </Typography>
          </Box>

          {/* Body */}
          <Box sx={{ px: 1.5, py: 1 }}>
            {item.NOMEPARC && (
              <Typography sx={{ fontSize: 12.5, mb: 0.5 }}>
                {item.ATUALESTOQUE === -1 ? 'Para: ' : item.ATUALESTOQUE === 1 ? 'De: ' : ''}
                <Box component="span" sx={{ fontWeight: 600 }}>{item.NOMEPARC}</Box>
              </Typography>
            )}

            {/* User row with avatar */}
            {item.NOMEUSU && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
                <FuncionarioAvatar codparc={item.CODPARC} nome={item.NOMEUSU} size="small" sx={{ width: 22, height: 22, fontSize: 10 }} />
                <Typography sx={{ fontSize: 11.5, color: 'text.secondary' }}>{item.NOMEUSU}</Typography>
              </Box>
            )}

            {/* Info chips */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
              {item.LOCAL_NOME && (
                <Chip label={item.LOCAL_NOME} size="small" variant="outlined"
                  sx={{ height: 20, fontSize: 10 }} />
              )}
              {item.NUMNOTA != null && item.NUMNOTA > 0 && (
                <Chip label={`Nota #${item.NUMNOTA}`} size="small" variant="outlined"
                  sx={{ height: 20, fontSize: 10, fontFamily: 'monospace' }} />
              )}
              {item.AVARIADO === 'S' && (
                <Chip label="Avariado" size="small" color="error" sx={{ height: 20, fontSize: 10, fontWeight: 600 }} />
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

function SerieTimeline({ codProd, serie }: { codProd: number; serie: string }) {
  const { data: historico, isLoading, error } = useHistoricoSerie(codProd, serie);

  if (isLoading) {
    return (
      <Box sx={{ p: 2 }}>
        {[1, 2, 3, 4].map((i) => (
          <Box key={i} sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Skeleton variant="text" width={60} />
            <Box sx={{ flex: 1 }}><Skeleton variant="text" width="80%" /><Skeleton variant="text" width="50%" /></Box>
          </Box>
        ))}
      </Box>
    );
  }

  if (error) return <Alert severity="error" sx={{ m: 2 }}>Erro ao carregar historico</Alert>;
  if (!historico?.length) return <Typography sx={{ p: 2, color: 'text.secondary' }}>Nenhum historico encontrado</Typography>;

  const filtered = historico.filter((h) => h.SEQUENCIA > 0);

  return (
    <Box sx={{ p: 2 }}>
      <Typography sx={{ fontSize: 11, color: 'text.disabled', mb: 2 }}>
        {filtered.length} movimentacao(es)
      </Typography>
      {filtered.map((item, idx) => (
        <TimelineItem
          key={`${item.NUNOTA}-${item.SEQUENCIA}-${idx}`}
          item={item}
          isLast={idx === filtered.length - 1}
        />
      ))}
    </Box>
  );
}

export function SeriesPage() {
  const [params, setParams] = useSearchParams();

  const selectedProduto = params.get('codProd') ? Number(params.get('codProd')) : null;
  const selectedSerieId = params.get('serie') ?? null;
  const searchTerm = params.get('q') ?? '';

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  const { data: produtos, isLoading: loadingProdutos, error: erroProdutos } = useProdutosComSeries();
  const { data: series, isLoading: loadingSeries } = useSeriesPorProduto(selectedProduto);
  const { data: resultadoBusca, isLoading: loadingBusca } = useBuscarSerie(searchTerm);

  const produtosFiltrados = useMemo(() => {
    if (!produtos) return [];
    if (!searchTerm || searchTerm.length < 3) return produtos;
    const lower = searchTerm.toLowerCase();
    return produtos.filter((p) => p.DESCRPROD.toLowerCase().includes(lower) || String(p.CODPROD).includes(searchTerm));
  }, [produtos, searchTerm]);

  const seriesExibidas = useMemo(() => {
    if (searchTerm.length >= 3 && resultadoBusca) return resultadoBusca;
    return series || [];
  }, [searchTerm, resultadoBusca, series]);

  const selectedSerie = useMemo(() => {
    if (!selectedSerieId) return null;
    return seriesExibidas.find((s) => s.SERIE === selectedSerieId) ?? null;
  }, [seriesExibidas, selectedSerieId]);

  const produtoNome = useMemo(() => {
    if (!produtos || !selectedProduto) return '';
    return produtos.find((x) => x.CODPROD === selectedProduto)?.DESCRPROD ?? '';
  }, [produtos, selectedProduto]);

  return (
    <Box sx={{ flex: 1, minHeight: 0, display: 'flex', overflow: 'hidden' }}>
      <Paper sx={{ width: 300, flexShrink: 0, overflow: 'auto', borderRight: 1, borderColor: 'divider', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ p: 2, pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>Series</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>Produtos com controle por serie</Typography>
          <TextField placeholder="Buscar serie ou produto..." size="small" fullWidth
            value={searchTerm} onChange={(e) => setParam('q', e.target.value)}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 18, color: 'text.disabled' }} /></InputAdornment> } }}
          />
        </Box>
        <Divider />
        {loadingProdutos && <Box sx={{ p: 2 }}>{[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} height={48} sx={{ mb: 0.5 }} />)}</Box>}
        {erroProdutos && <Alert severity="error" sx={{ m: 2 }}>{(erroProdutos as Error).message}</Alert>}
        {!loadingProdutos && !produtosFiltrados.length && !erroProdutos && (
          <Typography sx={{ p: 2, color: 'text.secondary', fontSize: 13 }}>Nenhum produto encontrado</Typography>
        )}
        <List dense sx={{ flex: 1, overflow: 'auto', py: 0 }}>
          {produtosFiltrados.map((produto) => (
            <ListItemButton key={produto.CODPROD} selected={selectedProduto === produto.CODPROD}
              onClick={() => { setParam('codProd', String(produto.CODPROD)); setParam('serie', ''); }}
              sx={{ py: 1, gap: 1 }}>
              <ProdutoThumb codProd={produto.CODPROD} size={36} />
              <ListItemText primary={produto.DESCRPROD} secondary={`Cod: ${produto.CODPROD}`}
                slotProps={{
                  primary: { sx: { fontSize: 13, fontWeight: selectedProduto === produto.CODPROD ? 600 : 400 }, noWrap: true },
                  secondary: { sx: { fontSize: 11 } },
                }} />
              <Chip label={produto.QTD_SERIES} size="small"
                sx={{ ml: 1, height: 22, fontSize: 11, fontWeight: 700, bgcolor: 'primary.main', color: 'primary.contrastText' }} />
            </ListItemButton>
          ))}
        </List>
      </Paper>

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {selectedProduto || (searchTerm.length >= 3 && resultadoBusca) ? (
          <>
            <Box sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {searchTerm.length >= 3 ? `Resultado da busca: "${searchTerm}"` : produtoNome}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {loadingSeries || loadingBusca ? 'Carregando...' : `${seriesExibidas.length} serie(s)`}
              </Typography>
            </Box>
            <Box sx={{ flex: 1, minHeight: 0 }}>
              <DataGrid rows={seriesExibidas} columns={columns}
                getRowId={(row) => `${row.CODPROD}-${row.SERIE}`}
                loading={loadingSeries || loadingBusca} density="compact" disableRowSelectionOnClick
                onRowClick={(p) => setParam('serie', (p.row as SerieAtual).SERIE)}
                pageSizeOptions={[25, 50, 100]}
                sx={{ border: 'none', '& .MuiDataGrid-row': { cursor: 'pointer' } }}
              />
            </Box>
          </>
        ) : (
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 1 }}>
            <Typography variant="h6" color="text.disabled">Selecione um produto</Typography>
            <Typography variant="body2" color="text.disabled">ou busque por uma serie no campo de busca</Typography>
          </Box>
        )}
      </Box>

      <Drawer anchor="right" open={!!selectedSerie} onClose={() => setParam('serie', '')}
        slotProps={{ paper: { sx: { width: { xs: '100%', sm: 520 } } } }}>
        {selectedSerie && (
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Header com info do produto e serie */}
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', bgcolor: (t) => t.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  <ProdutoThumb codProd={selectedSerie.CODPROD} size={56} />
                  <Box>
                    <Typography variant="h6" sx={{ fontFamily: 'monospace', fontWeight: 700, lineHeight: 1.2 }}>{selectedSerie.SERIE}</Typography>
                    <Typography variant="body2" color="text.secondary">{selectedSerie.DESCRPROD}</Typography>
                    <Typography variant="caption" color="text.disabled">Cod. {selectedSerie.CODPROD}</Typography>
                  </Box>
                </Box>
                <IconButton onClick={() => setParam('serie', '')} size="small"><Close /></IconButton>
              </Box>

              {/* Status chips */}
              <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                {selectedSerie.COM_QUEM && (
                  <Chip label={`Com: ${selectedSerie.COM_QUEM}`} size="small" variant="outlined" sx={{ fontSize: 11, fontWeight: 600 }} />
                )}
                {selectedSerie.LOCAL_ATUAL && (
                  <Chip label={selectedSerie.LOCAL_ATUAL} size="small" variant="outlined" color="info" sx={{ fontSize: 11 }} />
                )}
                {selectedSerie.DESCROPER && (
                  <Chip label={selectedSerie.DESCROPER} size="small"
                    sx={{ fontSize: 10, height: 22, bgcolor: `${TIPMOV_COLORS[selectedSerie.TIPMOV ?? ''] ?? '#757575'}18`, color: TIPMOV_COLORS[selectedSerie.TIPMOV ?? ''] ?? '#757575' }} />
                )}
                {selectedSerie.ULTIMA_MOVIMENTACAO && (
                  <Chip label={`Ult. mov: ${fmtDateShort(selectedSerie.ULTIMA_MOVIMENTACAO)}`} size="small" variant="outlined" sx={{ fontSize: 10 }} />
                )}
                {selectedSerie.AVARIADO === 'S' && (
                  <Chip label="Avariado" size="small" color="error" sx={{ fontSize: 11, fontWeight: 600 }} />
                )}
              </Box>
            </Box>

            {/* Timeline */}
            <Box sx={{ px: 2, pt: 1.5, pb: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary' }}>Historico completo</Typography>
            </Box>
            <Divider />
            <Box sx={{ flex: 1, overflow: 'auto' }}>
              <SerieTimeline codProd={selectedSerie.CODPROD} serie={selectedSerie.SERIE} />
            </Box>
          </Box>
        )}
      </Drawer>
    </Box>
  );
}
