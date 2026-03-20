import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Divider,
} from '@mui/material';
import { ArrowBack, ContentCopy } from '@mui/icons-material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { getUsuario, getUsuarioPermissoes } from '@/api/permissions';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { useState } from 'react';
import type { UserPermission } from '@/types/permission-types';

export default function UsuarioDetailPage() {
  const { codUsu } = useParams<{ codUsu: string }>();
  const navigate = useNavigate();
  const usuarioId = Number(codUsu);

  const { data: usuario, isLoading: loadingUsuario } = useQuery({
    queryKey: ['usuario', usuarioId],
    queryFn: () => getUsuario(usuarioId),
    enabled: !!usuarioId,
  });

  const { data: permissoes, isLoading: loadingPermissoes } = useQuery({
    queryKey: ['usuario-permissoes', usuarioId],
    queryFn: () => getUsuarioPermissoes(usuarioId),
    enabled: !!usuarioId,
  });

  const [copied, setCopied] = useState(false);

  const handleCopyPermissoes = () => {
    if (!permissoes) return;
    const text = permissoes.map((p) => `${p.IDACESSO}|${p.ACESSO}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const columns: GridColDef<UserPermission>[] = [
    { field: 'IDACESSO', headerName: 'Recurso', flex: 1, minWidth: 300 },
    { field: 'ACESSO', headerName: 'Acesso', width: 120 },
    { field: 'CODGRUPO', headerName: 'Grupo', width: 100 },
  ];

  if (loadingUsuario) {
    return <LoadingSkeleton message="Carregando usuario..." />;
  }

  if (!usuario) {
    return (
      <Box>
        <Typography>Usuario nao encontrado</Typography>
        <Button onClick={() => navigate('/usuarios')}>Voltar</Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/usuarios')}>
          Voltar
        </Button>
        <Typography variant="h4">Usuario: {usuario.NOMEUSU}</Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Dados do Usuario
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Codigo
                </Typography>
                <Typography variant="body1">{usuario.CODUSU}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Nome
                </Typography>
                <Typography variant="body1">{usuario.NOMEUSU}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Email
                </Typography>
                <Typography variant="body1">{usuario.EMAIL || '-'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Codigo Funcionario
                </Typography>
                <Typography variant="body1">{usuario.CODFUNC || '-'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Centro de Custo
                </Typography>
                <Typography variant="body1">{usuario.CODCENCUSPAD || '-'}</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Permissoes ({permissoes?.length ?? 0})
              </Typography>
              <Button
                size="small"
                startIcon={<ContentCopy />}
                onClick={handleCopyPermissoes}
              >
                {copied ? 'Copiado!' : 'Copiar'}
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />

            {loadingPermissoes ? (
              <LoadingSkeleton />
            ) : (
              <DataGrid
                rows={permissoes ?? []}
                columns={columns}
                density="compact"
                sx={{ height: 400 }}
                disableRowSelectionOnClick
                initialState={{
                  sorting: { sortModel: [{ field: 'IDACESSO', sort: 'asc' }] },
                }}
              />
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
