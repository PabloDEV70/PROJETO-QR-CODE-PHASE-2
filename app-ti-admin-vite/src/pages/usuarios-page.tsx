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
import type { SankhyaUser } from '@/types/permission-types';

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

  const rows: SankhyaUser[] = data?.data ?? [];
  const total = data?.meta?.total ?? 0;

  const handlePaginationModelChange = useCallback((model: GridPaginationModel) => {
    setPage(model.page);
    setPageSize(model.pageSize);
  }, []);

  const columns: GridColDef<SankhyaUser>[] = [
    { field: 'CODUSU', headerName: 'Codigo', width: 100 },
    { field: 'NOMEUSU', headerName: 'Nome', flex: 1, minWidth: 200 },
    { field: 'EMAIL', headerName: 'Email', flex: 1, minWidth: 250 },
    {
      field: 'CODFUNC',
      headerName: 'Cod Func',
      width: 100,
      valueGetter: (value) => value ?? '-',
    },
    {
      field: 'CODCENCUSPAD',
      headerName: 'Centro Custo',
      width: 130,
      valueGetter: (value) => value ?? '-',
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
          rowCount={total}
          paginationMode="server"
          paginationModel={{ page, pageSize }}
          onPaginationModelChange={handlePaginationModelChange}
          pageSizeOptions={[10, 25, 50, 100]}
          onRowClick={(params) => navigate(`/usuarios/${params.row.CODUSU}`)}
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
