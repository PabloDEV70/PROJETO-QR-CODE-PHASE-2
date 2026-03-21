import { useLocation, useNavigate } from 'react-router-dom';
import {
  Drawer, List, ListItemButton, ListItemIcon, ListItemText,
  Toolbar, Typography, Box, Divider, useMediaQuery, useTheme,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  ShoppingCart,
  Build,
  RequestQuote,
} from '@mui/icons-material';

const DRAWER_WIDTH = 240;

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  group: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Acompanhamento', path: '/acompanhamento-compras', icon: <DashboardIcon />, group: 'Principal' },
  { label: 'Requisicoes Compras', path: '/requisicoes-compras', icon: <ShoppingCart />, group: 'Requisicoes' },
  { label: 'Requisicoes Manutencao', path: '/requisicoes-manutencao', icon: <Build />, group: 'Requisicoes' },
  { label: 'Cotacoes', path: '/cotacoes', icon: <RequestQuote />, group: 'Cotacoes' },
];

interface SidebarNavProps {
  mobileOpen: boolean;
  onClose: () => void;
}

export function SidebarNav({ mobileOpen, onClose }: SidebarNavProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const handleNav = (path: string) => {
    navigate(path);
    if (!isDesktop) onClose();
  };

  const content = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar sx={{ gap: 1 }}>
        <Typography
          sx={{
            fontFamily: "'STOP', 'Arial Black', sans-serif",
            fontSize: 16,
            letterSpacing: '0.06em',
            color: 'primary.main',
          }}
        >
          GIGANTAO
        </Typography>
        <Typography sx={{ fontSize: 11, color: 'text.secondary', fontWeight: 600 }}>
          Compras
        </Typography>
      </Toolbar>
      <Divider />

      <List sx={{ flex: 1, px: 1, py: 0.5 }}>
        {(() => {
          let lastGroup = '';
          return NAV_ITEMS.map((item) => {
            const showGroup = item.group !== lastGroup;
            lastGroup = item.group;
            return (
              <Box key={item.path}>
                {showGroup && (
                  <Typography
                    variant="overline"
                    sx={{ px: 1.5, pt: 2, pb: 0.5, display: 'block', color: 'text.secondary' }}
                  >
                    {item.group}
                  </Typography>
                )}
                <ListItemButton
                  selected={isActive(item.path)}
                  onClick={() => handleNav(item.path)}
                  sx={{
                    borderRadius: 2,
                    mb: 0.25,
                    py: 0.75,
                    '&.Mui-selected': {
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      '&:hover': { bgcolor: 'primary.dark' },
                      '& .MuiListItemIcon-root': { color: 'inherit' },
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    slotProps={{ primary: { fontSize: 13, fontWeight: 500 } }}
                  />
                </ListItemButton>
              </Box>
            );
          });
        })()}
      </List>
    </Box>
  );

  if (isDesktop) {
    return (
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            borderRight: '1px solid',
            borderColor: 'divider',
          },
        }}
      >
        {content}
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="temporary"
      open={mobileOpen}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      sx={{
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
        },
      }}
    >
      {content}
    </Drawer>
  );
}

export { DRAWER_WIDTH };
