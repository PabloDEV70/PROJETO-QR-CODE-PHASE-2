import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Person,
  Logout,
  Map,
} from '@mui/icons-material';
import { useAuthStore } from '@/stores/auth-store';
import { pagesConfig } from '@/components/layout/pages-config';
import { FuncionarioAvatar } from '@/components/shared/funcionario-avatar';

export function AppHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const database = useAuthStore((s) => s.database);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    logout();
    navigate('/login');
  };

  const currentPage = pagesConfig.find((p) => p.path === location.pathname);

  return (
    <AppBar position="sticky" color="primary">
      <Toolbar>
        <IconButton
          color="inherit"
          edge="start"
          onClick={handleMenu}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          TI Admin {currentPage && `- ${currentPage.label}`}
        </Typography>
        <Typography variant="caption" sx={{ mr: 2, opacity: 0.8 }}>
          [{database}]
        </Typography>
        <IconButton color="inherit" onClick={handleMenu}>
          <FuncionarioAvatar
            codparc={user?.codparc}
            codfunc={user?.codfunc}
            nome={user?.nome}
            size="small"
          />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          PaperProps={{
            sx: { width: 220, mt: 1 },
          }}
        >
          <Box sx={{ px: 2, py: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <FuncionarioAvatar
              codparc={user?.codparc}
              codfunc={user?.codfunc}
              nome={user?.nome}
              size="medium"
            />
            <Box>
              <Typography variant="subtitle2">{user?.nome}</Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.nomecompleto || 'Sem email'}
              </Typography>
            </Box>
          </Box>
          <Divider />
          <MenuItem onClick={() => { handleClose(); navigate('/perfil'); }}>
            <ListItemIcon><Person fontSize="small" /></ListItemIcon>
            <ListItemText>Perfil</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => { handleClose(); navigate('/sitemap'); }}>
            <ListItemIcon><Map fontSize="small" /></ListItemIcon>
            <ListItemText>Mapa do App</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout}>
            <ListItemIcon><Logout fontSize="small" /></ListItemIcon>
            <ListItemText>Sair</ListItemText>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
