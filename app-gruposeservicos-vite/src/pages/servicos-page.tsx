import { useState, useMemo } from 'react';
import {
  Box, Typography, TextField, InputAdornment,
  CircularProgress, Stack, Alert, Chip,
} from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { Search, Build } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getArvoreCompleta } from '@/api/grupos';
import type { ArvoreGrupo } from '@/types/grupo-types';

interface FlatServico {
  id: number;
  codProd: number;
  descrProd: string;
  codGrupoProd: number;
  nomeGrupo: string;
  utilizacoes: number;
  grau: number;
}

function flattenServicos(nodes: ArvoreGrupo[], result: FlatServico[] = []): FlatServico[] {
  for (const n of nodes) {
    if (n.servicos) {
      for (const s of n.servicos) {
        result.push({
          id: s.codProd,
          codProd: s.codProd,
          descrProd: s.descrProd,
          codGrupoProd: n.codGrupoProd,
          nomeGrupo: n.descrGrupoProd,
          utilizacoes: s.utilizacoes,
          grau: n.grau,
        });
      }
    }
    flattenServicos(n.children, result);
  }
  return result;
}

export function ServicosPage() {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const { data: arvore, isLoading, error } = useQuery({
    queryKey: ['servicos-grupo-arvore'],
    queryFn: getArvoreCompleta,
    staleTime: 10 * 60 * 1000,
  });

  const allServicos = useMemo(() => (arvore ? flattenServicos(arvore) : []), [arvore]);

  const filtered = useMemo(() => {
    if (!search.trim()) return allServicos;
    const q = search.toLowerCase();
    return allServicos.filter(
      (s) =>
        s.descrProd.toLowerCase().includes(q) ||
        String(s.codProd).includes(q) ||
        s.nomeGrupo.toLowerCase().includes(q),
    );
  }, [allServicos, search]);

  const columns: GridColDef<FlatServico>[] = [
    {
      field: 'codProd',
      headerName: 'Codigo',
      width: 100,
      renderCell: ({ value }) => (
        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 12 }}>
          {value}
        </Typography>
      ),
    },
    {
      field: 'descrProd',
      headerName: 'Servico',
      flex: 1,
      minWidth: 250,
    },
    {
      field: 'nomeGrupo',
      headerName: 'Grupo',
      flex: 0.7,
      minWidth: 200,
      renderCell: ({ row }) => (
        <Chip
          label={row.nomeGrupo}
          size="small"
          onClick={() => navigate(`/grupo/${row.codGrupoProd}`)}
          sx={{
            cursor: 'pointer',
            maxWidth: '100%',
            fontSize: 12,
            '&:hover': { bgcolor: 'primary.light', color: 'primary.contrastText' },
          }}
        />
      ),
    },
    {
      field: 'codGrupoProd',
      headerName: 'Cod Grupo',
      width: 100,
      renderCell: ({ value }) => (
        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 12, color: 'text.secondary' }}>
          {value}
        </Typography>
      ),
    },
    {
      field: 'utilizacoes',
      headerName: 'Utilizacoes',
      width: 120,
      align: 'right',
      headerAlign: 'right',
      renderCell: ({ value }) => (
        <Chip
          label={value as number}
          size="small"
          sx={{
            height: 22, fontSize: 12, fontWeight: 700,
            bgcolor: (value as number) > 0 ? 'success.light' : 'action.hover',
            color: (value as number) > 0 ? 'success.dark' : 'text.disabled',
          }}
        />
      ),
    },
  ];

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
        <Stack spacing={2} alignItems="center">
          <CircularProgress />
          <Typography variant="body2" color="text.secondary">Carregando servicos...</Typography>
        </Stack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Erro ao carregar servicos: {error instanceof Error ? error.message : 'Erro desconhecido'}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <Box sx={{ p: 2, pb: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
          <Build sx={{ color: 'primary.main' }} />
          <Typography variant="h6" fontWeight={700}>
            Servicos
          </Typography>
          <Chip
            label={`${filtered.length} de ${allServicos.length}`}
            size="small"
            variant="outlined"
            sx={{ fontSize: 11 }}
          />
        </Stack>

        <TextField
          placeholder="Buscar por nome, codigo ou grupo..."
          size="small"
          fullWidth
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ fontSize: 20, color: 'text.disabled' }} />
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>

      <Box sx={{ flex: 1, minHeight: 0 }}>
        <DataGrid
          rows={filtered}
          columns={columns}
          density="compact"
          disableColumnMenu
          pageSizeOptions={[25, 50, 100]}
          initialState={{
            pagination: { paginationModel: { pageSize: 50 } },
            sorting: { sortModel: [{ field: 'utilizacoes', sort: 'desc' }] },
          }}
          sx={{
            border: 'none',
            '& .MuiDataGrid-cell': { fontSize: 13 },
            '& .MuiDataGrid-columnHeader': { fontWeight: 700, fontSize: 12 },
          }}
        />
      </Box>
    </Box>
  );
}
