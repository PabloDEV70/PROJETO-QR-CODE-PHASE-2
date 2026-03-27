import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  InputAdornment,
  Typography,
  Button,
} from '@mui/material';
import { Search } from '@mui/icons-material';
import { DataGrid, type GridColDef, type GridPaginationModel } from '@mui/x-data-grid';
import { useQuery } from '@tanstack/react-query';
import { listUsuarios } from '@/api/permissions';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';

export default function UsuariosPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['usuarios', search, page, pageSize],
    queryFn: () => listUsuarios({
      term: search || undefined,
      page,
      limit: pageSize,
    }),
  });

  const rows = data?.data ?? [];
  const total = data?.meta?.total ?? 0;

  const handlePaginationModelChange = useCallback((model: GridPaginationModel) => {
    setPage(model.page);
    setPageSize(model.pageSize);
  }, []);

  const columns: GridColDef[] = [
    { field: 'codusu', headerName: 'Codigo', width: 100 },
    { field: 'nomeusu', headerName: 'Nome', flex: 1, minWidth: 200 },
    { field: 'email', headerName: 'Email', flex: 1, minWidth: 250 },
    { field: 'nomeempresa', headerName: 'Empresa', width: 180 },
    { field: 'nomegrupo', headerName: 'Grupo', width: 150 },
    {
      field: 'ativo',
      headerName: 'Ativo',
      width: 80,
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Usuarios</Typography>
      </Box>

      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <TextField
          placeholder="Buscar por nome ou email..."
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
        <Button variant="outlined" onClick={() => refetch()}>
          Atualizar
        </Button>
      </Box>

      {isLoading ? (
        <LoadingSkeleton />
      ) : (
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={(row) => row.codusu ?? row.CODUSU ?? Math.random()}
          rowCount={total}
          paginationMode="server"
          paginationModel={{ page, pageSize }}
          onPaginationModelChange={handlePaginationModelChange}
          pageSizeOptions={[10, 25, 50, 100]}
          onRowClick={(params) => navigate(`/usuarios/${params.row.codusu ?? params.row.CODUSU}`)}
          sx={{
            '& .MuiDataGrid-row': { cursor: 'pointer' },
            height: 600,
          }}
          disableRowSelectionOnClick
        />
      )}
    </Box>
  );
}
