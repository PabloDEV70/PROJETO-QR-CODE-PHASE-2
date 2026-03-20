import { useNavigate } from 'react-router-dom';
import { Box, Typography, List, ListItemButton, ListItemIcon, ListItemText, IconButton, AppBar, Toolbar } from '@mui/material';
import { ArrowBack, Home, Person, Build, Settings, DirectionsCar, List as ListIcon } from '@mui/icons-material';

interface RouteItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

const routes: RouteItem[] = [
  { path: '/', label: 'Dashboard', icon: <Home /> },
  { path: '/selecionar', label: 'Selecionar Colaborador', icon: <Person /> },
  { path: '/configuracoes', label: 'Configuracoes', icon: <Settings /> },
  { path: '/veiculos-placas', label: 'Placas de Veiculos', icon: <DirectionsCar /> },
  { path: '/guindautos', label: 'Guindautos', icon: <Build /> },
  { path: '/veiculos-tabela', label: 'Tabela de Veiculos', icon: <ListIcon /> },
];

export function SitemapPage() {
  const navigate = useNavigate();

  return (
    <Box sx={{ pb: 2 }}>
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar variant="dense">
          <IconButton edge="start" onClick={() => navigate(-1)} sx={{ mr: 1 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" fontWeight={600}>
            Mapa do App
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {routes.length} pagina(s) disponivel(is)
        </Typography>

        <List>
          {routes.map((route) => (
            <ListItemButton
              key={route.path}
              onClick={() => navigate(route.path)}
              sx={{
                borderRadius: 1,
                mb: 0.5,
                border: '1px solid',
                borderColor: 'divider',
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: 'primary.main' }}>
                {route.icon}
              </ListItemIcon>
              <ListItemText
                primary={route.label}
                secondary={route.path}
                primaryTypographyProps={{ fontWeight: 500, fontSize: '0.9rem' }}
                secondaryTypographyProps={{ fontSize: '0.75rem' }}
              />
            </ListItemButton>
          ))}
        </List>
      </Box>
    </Box>
  );
}

export default SitemapPage;
