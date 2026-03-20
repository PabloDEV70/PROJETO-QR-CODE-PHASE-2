import { Box, Typography, Stack, Paper } from '@mui/material';
import { Label, ArrowForward } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';

const ETIQUETAS = [
  {
    title: 'Armarios',
    description: 'Etiquetas com QR Code para armarios de funcionarios',
    path: '/armarios',
    icon: Label,
    count: 'Listagem, filtros, impressao individual e em lote',
  },
];

export function HomePage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  return (
    <Box>
      <Typography sx={{ fontSize: 20, fontWeight: 700, mb: 0.5 }}>
        Ola, {user?.nome || user?.username || 'Usuario'}
      </Typography>
      <Typography sx={{ fontSize: 14, color: 'text.secondary', mb: 4 }}>
        Selecione o tipo de etiqueta que deseja gerar
      </Typography>

      <Stack spacing={2} sx={{ maxWidth: 600 }}>
        {ETIQUETAS.map((item) => (
          <Paper
            key={item.path}
            onClick={() => navigate(item.path)}
            sx={{
              p: 3, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 2.5,
              transition: 'all 0.2s ease',
              '&:hover': {
                borderColor: 'primary.main',
                boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                transform: 'translateY(-1px)',
              },
            }}
          >
            <Box sx={{
              width: 48, height: 48, borderRadius: 2,
              bgcolor: 'primary.main', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <item.icon />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontSize: 16, fontWeight: 700 }}>
                {item.title}
              </Typography>
              <Typography sx={{ fontSize: 13, color: 'text.secondary', mt: 0.25 }}>
                {item.description}
              </Typography>
              <Typography sx={{ fontSize: 11, color: 'text.disabled', mt: 0.5 }}>
                {item.count}
              </Typography>
            </Box>
            <ArrowForward sx={{ color: 'text.disabled', fontSize: 20 }} />
          </Paper>
        ))}
      </Stack>
    </Box>
  );
}
