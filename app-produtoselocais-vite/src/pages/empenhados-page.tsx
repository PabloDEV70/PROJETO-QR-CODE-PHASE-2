import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box, Paper, List, ListItemButton, ListItemText, Typography,
  Chip, TextField, InputAdornment, Skeleton,
} from '@mui/material';
import { Search } from '@mui/icons-material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { FuncionarioAvatar } from '@/components/shared/funcionario-avatar';
import { ProdutoThumb } from '@/components/shared/produto-thumb';
import { useColaboradoresComMateriais, useMateriaisDoUsuario } from '@/hooks/use-series';

const columns: GridColDef[] = [
  { field: 'CODPROD', headerName: '', width: 52, sortable: false, filterable: false,
    renderCell: (p) => <ProdutoThumb codProd={p.value as number} size={36} />,
  },
  { field: 'DESCRPROD', headerName: 'Produto', flex: 1, minWidth: 200 },
  { field: 'DESCRGRUPOPROD', headerName: 'Grupo', width: 200 },
  { field: 'QTDE', headerName: 'Qtde', width: 80, type: 'number' },
];

export function EmpenhadosPage() {
  const [params, setParams] = useSearchParams();

  const selectedCodusu = params.get('codusu') ? Number(params.get('codusu')) : null;
  const search = params.get('q') ?? '';

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  const { data: colaboradores, isLoading: loadingColab } = useColaboradoresComMateriais();
  const { data: materiais, isLoading: loadingMateriais } = useMateriaisDoUsuario(selectedCodusu);

  const selected = useMemo(() => {
    if (!selectedCodusu || !colaboradores) return null;
    return colaboradores.find((c) => c.CODUSU === selectedCodusu) ?? null;
  }, [colaboradores, selectedCodusu]);

  const filtered = useMemo(() => {
    if (!colaboradores) return [];
    if (!search.trim()) return colaboradores;
    const term = search.toLowerCase();
    return colaboradores.filter((c) =>
      c.NOMEUSU.toLowerCase().includes(term) || c.NOMEPARC.toLowerCase().includes(term),
    );
  }, [colaboradores, search]);

  return (
    <Box sx={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
      <Paper sx={{ width: 350, minWidth: 350, display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRight: 1, borderColor: 'divider', borderRadius: 0 }}>
        <Box sx={{ p: 2, pb: 1 }}>
          <Typography variant="h6" gutterBottom>Colaboradores</Typography>
          <TextField fullWidth size="small" placeholder="Filtrar por nome..."
            value={search} onChange={(e) => setParam('q', e.target.value)}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search /></InputAdornment> } }}
          />
        </Box>

        <List sx={{ overflow: 'auto', flex: 1 }}>
          {loadingColab
            ? Array.from({ length: 8 }).map((_, i) => (
                <Box key={i} sx={{ px: 2, py: 1 }}>
                  <Skeleton variant="text" width="70%" />
                  <Skeleton variant="text" width="40%" height={16} />
                </Box>
              ))
            : filtered.map((colab) => (
                <ListItemButton key={colab.CODUSU} selected={selectedCodusu === colab.CODUSU}
                  onClick={() => setParam('codusu', String(colab.CODUSU))}
                  sx={{ gap: 1 }}>
                  <FuncionarioAvatar codparc={colab.CODPARC} nome={colab.NOMEUSU} size="small" />
                  <ListItemText primary={colab.NOMEUSU} secondary={colab.NOMEPARC}
                    primaryTypographyProps={{ noWrap: true }}
                    secondaryTypographyProps={{ noWrap: true, variant: 'caption' }} />
                  <Box sx={{ display: 'flex', gap: 0.5, ml: 1, flexShrink: 0 }}>
                    <Chip label={`${colab.QTD_PRODUTOS} prod`} size="small" color="primary" variant="outlined" />
                    <Chip label={`${colab.QTD_TOTAL} un`} size="small" color="secondary" variant="outlined" />
                  </Box>
                </ListItemButton>
              ))}
        </List>

        {!loadingColab && (
          <Box sx={{ p: 1, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="caption" color="text.secondary">
              {filtered.length} colaborador{filtered.length !== 1 ? 'es' : ''}
            </Typography>
          </Box>
        )}
      </Paper>

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {!selected ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <Typography color="text.secondary">Selecione um colaborador para ver os materiais empenhados</Typography>
          </Box>
        ) : (
          <>
            <Box sx={{ p: 2, pb: 1, borderBottom: 1, borderColor: 'divider', display: 'flex', gap: 2, alignItems: 'center' }}>
              <FuncionarioAvatar codparc={selected.CODPARC} nome={selected.NOMEUSU} size="large" />
              <Box>
              <Typography variant="h6">{selected.NOMEUSU}</Typography>
              <Typography variant="body2" color="text.secondary">
                {selected.NOMEPARC} — {selected.QTD_PRODUTOS} produto{selected.QTD_PRODUTOS !== 1 ? 's' : ''}, {selected.QTD_TOTAL} unidade{selected.QTD_TOTAL !== 1 ? 's' : ''}
              </Typography>
              </Box>
            </Box>
            <Box sx={{ flex: 1, minHeight: 0 }}>
              <DataGrid rows={materiais ?? []} columns={columns} loading={loadingMateriais}
                getRowId={(row) => row.CODPROD} density="compact" disableRowSelectionOnClick
                initialState={{ sorting: { sortModel: [{ field: 'DESCRGRUPOPROD', sort: 'asc' }] } }}
                sx={{ border: 'none', '& .MuiDataGrid-cell': { fontSize: 13 } }}
              />
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
}
