import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Divider,
} from '@mui/material';
import { Person, Email, Group, Business } from '@mui/icons-material';
import { useAuthStore } from '@/stores/auth-store';

export default function PerfilPage() {
  const user = useAuthStore((s) => s.user);
  const database = useAuthStore((s) => s.database);
  const isAdmin = useAuthStore((s) => s.isAdmin);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Perfil
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Dados do usuario logado
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Informacoes do Usuario
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Person color="primary" />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Nome
                  </Typography>
                  <Typography variant="body1">
                    {user?.nome || 'Nao informado'}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Email color="primary" />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body1">
                    {user?.nomecompleto || 'Nao informado'}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Group color="primary" />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Codigo Usuario
                  </Typography>
                  <Typography variant="body1">
                    {user?.codusu || '-'}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Business color="primary" />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Base de Dados
                  </Typography>
                  <Typography variant="body1">
                    {database}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Permissoes
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                label={isAdmin ? 'Administrador' : 'Usuario'}
                color={isAdmin ? 'error' : 'default'}
              />
              <Chip label={`Base: ${database}`} variant="outlined" />
            </Box>

            {user?.nomegrupo && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Grupo
                </Typography>
                <Chip label={user.nomegrupo} />
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
