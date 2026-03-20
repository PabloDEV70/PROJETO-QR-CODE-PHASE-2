import { useParams } from 'react-router-dom';
import {
  Box, Typography, Stack, Skeleton, Paper, Grid,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useMotivo } from '@/hooks/use-motivos';

const lightTheme = createTheme({
  palette: { mode: 'light' },
  typography: { fontFamily: "'Inter', sans-serif" },
});

export function MotivoPublicPage() {
  const { id: raw } = useParams<{ id: string }>();
  const codigo = raw ? Number(raw) : 0;
  const { data: motivo, isLoading, isError } = useMotivo(codigo);

  return (
    <ThemeProvider theme={lightTheme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#f1f5f9',
          p: 2,
        }}
      >
        {isLoading && (
          <Paper sx={{ p: 4, borderRadius: '16px', maxWidth: 400, width: '100%' }}>
            <Stack alignItems="center" spacing={2}>
              <Skeleton variant="circular" width={96} height={96} />
              <Skeleton variant="rounded" width={200} height={24} />
              <Skeleton variant="rounded" width={160} height={16} />
            </Stack>
          </Paper>
        )}

        {!isLoading && (isError || !motivo) && (
          <Paper sx={{ p: 4, borderRadius: '16px', textAlign: 'center' }}>
            <Typography sx={{ fontSize: 48, mb: 1 }}>404</Typography>
            <Typography sx={{ color: '#64748b' }}>
              Motivo nao encontrado.
            </Typography>
          </Paper>
        )}

        {!isLoading && motivo && (
          <Paper sx={{ p: 4, borderRadius: '16px', maxWidth: 500, width: '100%' }}>
            <Stack alignItems="center" spacing={3}>
              <Box
                sx={{
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  bgcolor: '#4CAF50',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography sx={{ fontSize: 42, fontWeight: 'bold', color: '#fff' }}>
                  {motivo.SIGLA || motivo.RDOMOTIVOCOD}
                </Typography>
              </Box>

              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  Codigo
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {motivo.RDOMOTIVOCOD}
                </Typography>
              </Box>

              <Box sx={{ textAlign: 'center', width: '100%' }}>
                <Typography variant="caption" color="text.secondary">
                  Descricao
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  {motivo.DESCRICAO}
                </Typography>
              </Box>

              <Grid container spacing={2} sx={{ width: '100%' }}>
                <Grid size={6}>
                  <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      Produtivo
                    </Typography>
                    <Typography
                      variant="body1"
                      fontWeight="bold"
                      color={motivo.PRODUTIVO === 'S' ? 'success.main' : 'error.main'}
                    >
                      {motivo.PRODUTIVO === 'S' ? 'Sim' : 'Nao'}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={6}>
                  <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      Ativo
                    </Typography>
                    <Typography
                      variant="body1"
                      fontWeight="bold"
                      color={motivo.ATIVO === 'S' ? 'success.main' : 'error.main'}
                    >
                      {motivo.ATIVO === 'S' ? 'Sim' : 'Nao'}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              {motivo.TOLERANCIA !== null && motivo.TOLERANCIA !== undefined && (
                <Grid container spacing={2} sx={{ width: '100%' }}>
                  <Grid size={6}>
                    <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        Tolerancia (min)
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {motivo.TOLERANCIA}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid size={6}>
                    <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        Penalidade (min)
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {motivo.PENALIDADE ?? 0}
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              )}

              <Typography variant="caption" color="text.secondary" sx={{ mt: 2 }}>
                Gigantao Engenharia de Movimentacao
              </Typography>
            </Stack>
          </Paper>
        )}
      </Box>
    </ThemeProvider>
  );
}
