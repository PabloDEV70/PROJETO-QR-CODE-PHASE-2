import { useState } from 'react';
import {
  IconButton, Menu, MenuItem, ListItemIcon,
  Divider, Typography, Box, Chip,
} from '@mui/material';
import { Logout, Person, Security } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';
import { useTotpStatus } from '@/hooks/use-totp';
import { TotpSetupDrawer } from '@/components/auth/totp-setup-drawer';
import { TotpDisableDialog } from '@/components/auth/totp-disable-dialog';
import { FuncionarioAvatar } from '@/components/shared/funcionario-avatar';

export function UserMenu() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [setupOpen, setSetupOpen] = useState(false);
  const [disableOpen, setDisableOpen] = useState(false);
  const open = Boolean(anchorEl);

  const { data: totpStatus } = useTotpStatus();
  const is2faEnabled = totpStatus?.enabled && totpStatus?.isVerified;

  const displayName = user?.nome || user?.username || '?';
  const subtitle = user?.nome ? user.username : 'Usuario do Sistema';

  const handleLogout = () => {
    setAnchorEl(null);
    logout();
  };

  const handle2faClick = () => {
    setAnchorEl(null);
    if (is2faEnabled) {
      setDisableOpen(true);
    } else {
      setSetupOpen(true);
    }
  };

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
        <FuncionarioAvatar
          codparc={user?.codparc}
          nome={displayName}
          size="small"
          sx={{ width: 32, height: 32 }}
        />
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
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle2" fontWeight="bold">
            {displayName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        </Box>
        <Divider />
        <MenuItem onClick={() => { setAnchorEl(null); navigate('/me'); }}>
          <ListItemIcon><Person fontSize="small" /></ListItemIcon>
          Meu Perfil
        </MenuItem>
        <MenuItem onClick={handle2faClick}>
          <ListItemIcon><Security fontSize="small" /></ListItemIcon>
          Seguranca 2FA
          <Chip
            label={is2faEnabled ? 'Ativo' : 'Inativo'}
            size="small"
            color={is2faEnabled ? 'success' : 'default'}
            sx={{ ml: 'auto', height: 20, fontSize: '0.7rem' }}
          />
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <ListItemIcon><Logout fontSize="small" /></ListItemIcon>
          Sair
        </MenuItem>
      </Menu>

      <TotpSetupDrawer open={setupOpen} onClose={() => setSetupOpen(false)} />
      <TotpDisableDialog open={disableOpen} onClose={() => setDisableOpen(false)} />
    </>
  );
}
