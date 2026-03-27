import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Divider,
  Chip,
} from '@mui/material';
import { ArrowBack, ContentCopy } from '@mui/icons-material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { getUsuario, getUsuarioDetalhes } from '@/api/permissions';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { useState } from 'react';
import type { UsuarioPermDireta } from '@/types/permission-types';

export default function UsuarioDetailPage() {
  const { codUsu } = useParams<{ codUsu: string }>();
  const navigate = useNavigate();
  const usuarioId = Number(codUsu);

  const { data: usuario, isLoading: loadingUsuario } = useQuery({
    queryKey: ['usuario', usuarioId],
    queryFn: () => getUsuario(usuarioId),
    enabled: !!usuarioId,
  });

  const { data: detalhes, isLoading: loadingDetalhes } = useQuery({
    queryKey: ['usuario-detalhes', usuarioId],
    queryFn: () => getUsuarioDetalhes(usuarioId),
    enabled: !!usuarioId,
  });

  const [copied, setCopied] = useState(false);

  const allPerms = [...(detalhes?.diretas ?? []), ...(detalhes?.herdadas ?? [])];

  const handleCopyPermissoes = () => {
    const text = allPerms.map((p) => `${p.idAcesso}|${p.acesso}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const columns: GridColDef<UsuarioPermDireta>[] = [
    { field: 'idAcesso', headerName: 'Recurso', flex: 1, minWidth: 300 },
    { field: 'nomeAmigavel', headerName: 'Nome', width: 200 },
    { field: 'acesso', headerName: 'Acesso', width: 120 },
  ];

  if (loadingUsuario) {
    return <LoadingSkeleton message="Carregando usuario..." />;
  }

  const nome = usuario?.nomeusu ?? usuario?.NOMEUSU ?? '-';

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/usuarios')}>
          Voltar
        </Button>
        <Typography variant="h4">Usuario: {nome}</Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Dados do Usuario</Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <InfoRow label="Codigo" value={usuario?.codusu ?? usuario?.CODUSU} />
              <InfoRow label="Nome" value={nome} />
              <InfoRow label="Email" value={usuario?.email ?? usuario?.EMAIL} />
              <InfoRow label="Empresa" value={usuario?.nomeempresa} />
              <InfoRow label="Grupo" value={detalhes?.nomeGrupo} />
            </Box>

            {detalhes && detalhes.conflitos.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" color="error.main" gutterBottom>
                  Conflitos ({detalhes.conflitos.length})
                </Typography>
                {detalhes.conflitos.map((c) => (
                  <Chip
                    key={c.idAcesso}
                    label={`${c.nomeAmigavel}: user=${c.acessoUsuario} grupo=${c.acessoGrupo}`}
                    color="error"
                    variant="outlined"
                    size="small"
                    sx={{ m: 0.5 }}
                  />
                ))}
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Permissoes ({allPerms.length})
              </Typography>
              <Button size="small" startIcon={<ContentCopy />} onClick={handleCopyPermissoes}>
                {copied ? 'Copiado!' : 'Copiar'}
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />

            {loadingDetalhes ? (
              <LoadingSkeleton />
            ) : (
              <DataGrid
                rows={allPerms}
                columns={columns}
                getRowId={(row) => row.idAcesso}
                density="compact"
                sx={{ height: 500 }}
                disableRowSelectionOnClick
                initialState={{
                  sorting: { sortModel: [{ field: 'idAcesso', sort: 'asc' }] },
                }}
              />
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

function InfoRow({ label, value }: { label: string; value: unknown }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography variant="body1">{value != null ? String(value) : '-'}</Typography>
    </Box>
  );
}
