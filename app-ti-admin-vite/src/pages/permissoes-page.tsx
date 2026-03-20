import { useState, useCallback } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  Typography,
  Button,
  Paper,
  Autocomplete,
} from '@mui/material';
import { Search, Refresh } from '@mui/icons-material';
import { DataGrid, type GridColDef, type GridPaginationModel } from '@mui/x-data-grid';
import { useQuery } from '@tanstack/react-query';
import { listRecursos, getRecursosPorPrefixo } from '@/api/permissions';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import type { SankhyaAccessResource } from '@/types/permission-types';

export default function PermissoesPage() {
  const [search, setSearch] = useState('');
  const [prefixoSelecionado, setPrefixoSelecionado] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);

  const { data: prefixos } = useQuery({
    queryKey: ['recursos-prefixos'],
    queryFn: () => getRecursosPorPrefixo(''),
    staleTime: 1000 * 60 * 10,
  });

  const prefixosUnicos = prefixos
    ? [...new Set(prefixos.map((r) => r.IDACESSO.split('.')[0]))].sort()
    : [];

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['recursos', prefixoSelecionado, page, pageSize],
    queryFn: () => listRecursos({
      term: prefixoSelecionado || search || undefined,
      page,
      limit: pageSize,
    }),
  });

  const rows: SankhyaAccessResource[] = data?.data ?? [];
  const total = data?.meta?.total ?? 0;

  const handlePaginationModelChange = useCallback((model: GridPaginationModel) => {
    setPage(model.page);
    setPageSize(model.pageSize);
  }, []);

  const handlePrefixoChange = (_: unknown, value: string | null) => {
    setPrefixoSelecionado(value);
    setPage(0);
  };

  const columns: GridColDef<SankhyaAccessResource>[] = [
    { field: 'IDACESSO', headerName: 'Recurso', flex: 1, minWidth: 400 },
    { field: 'SIGLA', headerName: 'Sigla', width: 120 },
    { field: 'DESCRICAO', headerName: 'Descricao', flex: 1, minWidth: 200 },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Recursos / Permissoes
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Lista de recursos disponiveis no Sankhya para atribuicao de permissoes
      </Typography>

      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Autocomplete
          options={prefixosUnicos}
          value={prefixoSelecionado}
          onChange={handlePrefixoChange}
          renderInput={(params) => (
            <TextField {...params} label="Filtrar por prefixo" size="small" sx={{ minWidth: 200 }} />
          )}
          freeSolo
          sx={{ minWidth: 200 }}
        />
        <TextField
          placeholder="Buscar recurso..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{ flex: 1, maxWidth: 400 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
        <Button variant="outlined" startIcon={<Refresh />} onClick={() => refetch()}>
          Atualizar
        </Button>
      </Box>

      {isLoading ? (
        <LoadingSkeleton />
      ) : (
        <Paper>
          <DataGrid
            rows={rows}
            columns={columns}
            rowCount={total}
            paginationMode="server"
            paginationModel={{ page, pageSize }}
            onPaginationModelChange={handlePaginationModelChange}
            pageSizeOptions={[10, 25, 50, 100]}
            sx={{
              height: 600,
            }}
            disableRowSelectionOnClick
            initialState={{
              sorting: { sortModel: [{ field: 'IDACESSO', sort: 'asc' }] },
            }}
          />
        </Paper>
      )}
    </Box>
  );
}
