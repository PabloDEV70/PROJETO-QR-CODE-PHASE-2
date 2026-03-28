import { useState } from 'react';
import {
  IconButton, Menu, MenuItem, ListItemIcon,
  Divider, Typography, Box, Avatar,
} from '@mui/material';
import { Logout, Person } from '@mui/icons-material';
import { useAuthStore } from '@/stores/auth-store';

export function UserMenu() {
  const { user, logout } = useAuthStore();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const displayName = user?.nome || user?.username || '?';
  const subtitle = user?.nome ? user.username : 'Usuario do Sistema';
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w: string) => w[0])
    .join('')
    .toUpperCase();

  return (
    <>
      <IconButton
        onClick={(e) => setAnchorEl(e.currentTarget)}
        size="small"
        sx={{ minHeight: 44, minWidth: 44 }}
        aria-controls={open ? 'user-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
      >
        <Avatar sx={{ width: 32, height: 32, fontSize: 13 }}>{initials}</Avatar>
      </IconButton>

      <Menu
        id="user-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        slotProps={{ paper: { elevation: 3, sx: { mt: 1, minWidth: 220 } } }}
      >
        <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ width: 40, height: 40, fontSize: 15 }}>{initials}</Avatar>
          <Box>
            <Typography variant="subtitle2" fontWeight="bold">
              {displayName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          </Box>
        </Box>
        <Divider />
        <MenuItem disabled sx={{ opacity: 0.6 }}>
          <ListItemIcon><Person fontSize="small" /></ListItemIcon>
          Meu Perfil
        </MenuItem>
        <MenuItem onClick={() => { setAnchorEl(null); logout(); }}>
          <ListItemIcon><Logout fontSize="small" /></ListItemIcon>
          Sair
        </MenuItem>
      </Menu>
    </>
  );
}
