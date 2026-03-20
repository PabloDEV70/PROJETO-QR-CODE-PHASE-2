import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Autocomplete,
  TextField,
  Chip,
  Divider,
} from '@mui/material';
import { Compare, ContentCopy, Warning } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { listUsuarios, comparePermissoes } from '@/api/permissions';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import type { SankhyaUser } from '@/types/permission-types';

export default function CompararPage() {
  const [usuarioA, setUsuarioA] = useState<SankhyaUser | null>(null);
  const [usuarioB, setUsuarioB] = useState<SankhyaUser | null>(null);

  const { data: usuariosData, isLoading: loadingUsuarios } = useQuery({
    queryKey: ['usuarios-all'],
    queryFn: () => listUsuarios({ limit: 500 }),
  });

  const usuarios = usuariosData?.data ?? [];

  const { data: comparacao, isLoading: loadingComparacao } = useQuery({
    queryKey: ['comparar', usuarioA?.CODUSU, usuarioB?.CODUSU],
    queryFn: () => comparePermissoes({
      usuarioA: usuarioA!.CODUSU,
      usuarioB: usuarioB!.CODUSU,
    }),
    enabled: !!usuarioA && !!usuarioB,
  });

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Comparar Permissoes
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Compare permissoes entre dois usuarios para identificar diferencas
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid size={{ xs: 12, md: 5 }}>
            <Autocomplete
              options={usuarios}
              getOptionLabel={(option) => `${option.NOMEUSU} (${option.CODUSU})`}
              value={usuarioA}
              onChange={(_, value) => setUsuarioA(value)}
              loading={loadingUsuarios}
              renderInput={(params) => (
                <TextField {...params} label="Usuario A" fullWidth />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 2 }} sx={{ textAlign: 'center' }}>
            <Compare />
          </Grid>
          <Grid size={{ xs: 12, md: 5 }}>
            <Autocomplete
              options={usuarios}
              getOptionLabel={(option) => `${option.NOMEUSU} (${option.CODUSU})`}
              value={usuarioB}
              onChange={(_, value) => setUsuarioB(value)}
              loading={loadingUsuarios}
              renderInput={(params) => (
                <TextField {...params} label="Usuario B" fullWidth />
              )}
            />
          </Grid>
        </Grid>
      </Paper>

      {loadingComparacao ? (
        <LoadingSkeleton message="Comparando permissoes..." />
      ) : comparacao ? (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" color="error.dark">
                  Apenas em A ({comparacao.onlyInA.length})
                </Typography>
                <Button
                  size="small"
                  startIcon={<ContentCopy />}
                  onClick={() => handleCopy(comparacao.onlyInA.map((p) => p.IDACESSO).join('\n'))}
                >
                  Copiar
                </Button>
              </Box>
              <Divider />
              <Box sx={{ mt: 2, maxHeight: 400, overflow: 'auto' }}>
                {comparacao.onlyInA.map((p) => (
                  <Chip
                    key={p.IDACESSO}
                    label={p.IDACESSO}
                    size="small"
                    sx={{ m: 0.5 }}
                    color="error"
                    variant="outlined"
                  />
                ))}
                {comparacao.onlyInA.length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    Nenhuma diferenca
                  </Typography>
                )}
              </Box>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" color="success.dark">
                  Comum ({comparacao.common.length})
                </Typography>
                <Button
                  size="small"
                  startIcon={<ContentCopy />}
                  onClick={() => handleCopy(comparacao.common.map((p) => p.IDACESSO).join('\n'))}
                >
                  Copiar
                </Button>
              </Box>
              <Divider />
              <Box sx={{ mt: 2, maxHeight: 400, overflow: 'auto' }}>
                {comparacao.common.map((p) => (
                  <Chip
                    key={p.IDACESSO}
                    label={p.IDACESSO}
                    size="small"
                    sx={{ m: 0.5 }}
                    color="success"
                    variant="outlined"
                  />
                ))}
                {comparacao.common.length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    Nenhuma permissao em comum
                  </Typography>
                )}
              </Box>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" color="warning.dark">
                  Apenas em B ({comparacao.onlyInB.length})
                </Typography>
                <Button
                  size="small"
                  startIcon={<ContentCopy />}
                  onClick={() => handleCopy(comparacao.onlyInB.map((p) => p.IDACESSO).join('\n'))}
                >
                  Copiar
                </Button>
              </Box>
              <Divider />
              <Box sx={{ mt: 2, maxHeight: 400, overflow: 'auto' }}>
                {comparacao.onlyInB.map((p) => (
                  <Chip
                    key={p.IDACESSO}
                    label={p.IDACESSO}
                    size="small"
                    sx={{ m: 0.5 }}
                    color="warning"
                    variant="outlined"
                  />
                ))}
                {comparacao.onlyInB.length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    Nenhuma diferenca
                  </Typography>
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Warning sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6">
            Selecione dois usuarios para comparar
          </Typography>
        </Paper>
      )}
    </Box>
  );
}
