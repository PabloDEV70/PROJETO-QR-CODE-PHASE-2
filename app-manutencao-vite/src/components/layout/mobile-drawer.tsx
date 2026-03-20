import { useState } from 'react';
import {
  SwipeableDrawer,
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Collapse,
} from '@mui/material';
import {
  Brightness4,
  Brightness7,
  Logout,
  ExpandLess,
  ExpandMore,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useThemeStore } from '@/stores/theme-store';
import { useAuthStore } from '@/stores/auth-store';
import { navPages, getSubpages } from '@/components/layout/pages-config';
import { Logo } from '@/components/layout/logo';

interface MobileDrawerProps {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export function MobileDrawer({ open, onOpen, onClose }: MobileDrawerProps) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { mode, toggleTheme } = useThemeStore();
  const logout = useAuthStore((s) => s.logout);

  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    for (const page of navPages) {
      if (getSubpages(page.path).length > 0 && pathname.startsWith(page.path)) {
        init[page.path] = true;
      }
    }
    return init;
  });

  const toggleExpand = (path: string) => {
    setExpanded((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  const go = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <SwipeableDrawer
      anchor="left"
      open={open}
      onOpen={onOpen}
      onClose={onClose}
      slotProps={{ paper: { sx: { width: 280 } } }}
    >
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Logo />
        <IconButton onClick={toggleTheme} size="small">
          {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
        </IconButton>
      </Box>

      <Divider />

      <List disablePadding sx={{ flex: 1 }}>
        {navPages.map((page) => {
          const Icon = page.icon;
          const active = isActive(page.path);
          const subpages = getSubpages(page.path);
          const hasChildren = subpages.length > 0;
          const isExpanded = expanded[page.path] ?? false;

          if (hasChildren) {
            return (
              <Box key={page.path}>
                <ListItemButton
                  selected={active && pathname === page.path}
                  onClick={() => toggleExpand(page.path)}
                  sx={{ py: 1.5 }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <Icon color={active ? 'primary' : 'inherit'} />
                  </ListItemIcon>
                  <ListItemText
                    primary={page.label}
                    slotProps={{ primary: { fontWeight: active ? 700 : 400 } }}
                  />
                  {isExpanded ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                  <List disablePadding>
                    {subpages.map((sub) => {
                      const SubIcon = sub.icon;
                      const subActive = pathname.startsWith(sub.path);
                      return (
                        <ListItemButton
                          key={sub.path}
                          sx={{ pl: 4, py: 1 }}
                          selected={subActive}
                          onClick={() => go(sub.path)}
                        >
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <SubIcon
                              fontSize="small"
                              color={subActive ? 'primary' : 'inherit'}
                            />
                          </ListItemIcon>
                          <ListItemText
                            primary={sub.label}
                            slotProps={{
                              primary: {
                                variant: 'body2',
                                fontWeight: subActive ? 600 : 400,
                              },
                            }}
                          />
                        </ListItemButton>
                      );
                    })}
                  </List>
                </Collapse>
              </Box>
            );
          }

          return (
            <ListItemButton
              key={page.path}
              selected={active}
              onClick={() => go(page.path)}
              sx={{ py: 1.5 }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <Icon color={active ? 'primary' : 'inherit'} />
              </ListItemIcon>
              <ListItemText
                primary={page.label}
                slotProps={{ primary: { fontWeight: active ? 700 : 400 } }}
              />
            </ListItemButton>
          );
        })}
      </List>

      <Divider />

      <List disablePadding>
        <ListItemButton onClick={() => { onClose(); logout(); }}>
          <ListItemIcon sx={{ minWidth: 40 }}>
            <Logout />
          </ListItemIcon>
          <ListItemText primary="Sair" />
        </ListItemButton>
      </List>
    </SwipeableDrawer>
  );
}
