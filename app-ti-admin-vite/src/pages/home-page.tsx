import { Box, Typography, Grid, Card, CardContent, CardActionArea } from '@mui/material';
import { People, Lock, CompareArrows, Search, MonitorHeart } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const navigate = useNavigate();

  const cards = [
    {
      title: 'Usuarios',
      description: 'Lista de usuarios do Sankhya',
      icon: People,
      path: '/usuarios',
      color: '#1976d2',
    },
    {
      title: 'Permissoes',
      description: 'Gerenciar permissoes por recurso',
      icon: Lock,
      path: '/permissoes',
      color: '#388e3c',
    },
    {
      title: 'Comparar',
      description: 'Comparar permissoes entre usuarios',
      icon: CompareArrows,
      path: '/comparar',
      color: '#f57c00',
    },
    {
      title: 'Investigar',
      description: 'Investigar documentos e registros',
      icon: Search,
      path: '/investigar',
      color: '#7b1fa2',
    },
    {
      title: 'Inspecao',
      description: 'Monitoramento de APIs, DB e seguranca',
      icon: MonitorHeart,
      path: '/inspecao',
      color: '#d32f2f',
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Administracao de permissoes e usuarios Sankhya
      </Typography>

      <Grid container spacing={3}>
        {cards.map((card) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={card.path}>
            <Card>
              <CardActionArea onClick={() => navigate(card.path)}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <card.icon sx={{ fontSize: 48, color: card.color, mb: 2 }} />
                  <Typography variant="h6">{card.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {card.description}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
