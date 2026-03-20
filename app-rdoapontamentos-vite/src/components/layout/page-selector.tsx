import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer, Box, Typography, IconButton, ListItemButton,
  ListItemIcon, ListItemText, InputBase, alpha,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { pagesConfig, type PageConfig } from '@/components/layout/pages-config';
import { useAuthStore } from '@/stores/auth-store';
import { DevIndicator } from '@/components/layout/dev-indicator';
import { ApiStatusIndicator } from '@/components/layout/api-status-indicator';

function useVisiblePages() {
  const isAdmin = useAuthStore((s) => s.isAdmin);
  return useMemo(
    () => pagesConfig.filter((p) => !p.hidden && (!p.adminOnly || isAdmin)),
    [isAdmin],
  );
}

function groupPages(pages: PageConfig[]) {
  const groups: { name: string; pages: PageConfig[] }[] = [];
  const seen = new Set<string>();
  for (const page of pages) {
    if (!seen.has(page.group)) {
      seen.add(page.group);
      groups.push({ name: page.group, pages: [] });
    }
    groups.find((g) => g.name === page.group)!.pages.push(page);
  }
  return groups;
}

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function PageSelector() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const allPages = useVisiblePages();
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return allPages;
    const q = normalize(query.trim());
    return allPages.filter(
      (p) =>
        normalize(p.label).includes(q) ||
        normalize(p.description ?? '').includes(q) ||
        normalize(p.group).includes(q),
    );
  }, [allPages, query]);

  const groups = useMemo(() => groupPages(filtered), [filtered]);

  const handleNav = (path: string) => {
    navigate(path);
    setOpen(false);
    setQuery('');
  };

  const handleClose = () => {
    setOpen(false);
    setQuery('');
  };

  // Ctrl+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Auto-focus search on open
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  // Keyboard nav inside drawer
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
      if (e.key === 'Enter' && filtered.length === 1) {
        handleNav(filtered[0].path);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, filtered]);

  return (
    <>
      <IconButton
        onClick={() => setOpen(true)}
        size="small"
        sx={{
          borderRadius: '8px',
          color: 'text.secondary',
          '&:hover': {
            bgcolor: (theme) => alpha(theme.palette.text.primary, 0.04),
          },
        }}
      >
        <MenuIcon sx={{ fontSize: 20 }} />
      </IconButton>

      <Drawer
        anchor="top"
        open={open}
        onClose={handleClose}
        slotProps={{
          paper: {
            sx: {
              maxHeight: '75dvh',
              borderRadius: '0 0 16px 16px',
              bgcolor: 'background.paper',
            },
          },
        }}
      >
        {/* Search bar */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 1.5,
            py: 1,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <SearchIcon sx={{ fontSize: 20, color: 'text.disabled' }} />
          <InputBase
            inputRef={inputRef}
            placeholder="Buscar tela..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            sx={{ flex: 1, fontSize: 14 }}
          />
          <Typography
            variant="caption"
            sx={{
              color: 'text.disabled',
              fontSize: '0.6rem',
              fontWeight: 600,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 0.5,
              px: 0.5,
              lineHeight: '16px',
              display: { xs: 'none', sm: 'block' },
            }}
          >
            Ctrl K
          </Typography>
          <IconButton size="small" onClick={handleClose} edge="end">
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>

        {/* Results */}
        <Box sx={{ overflow: 'auto', py: 0.5 }}>
          {groups.length === 0 ? (
            <Typography
              variant="body2"
              color="text.disabled"
              sx={{ textAlign: 'center', py: 3 }}
            >
              Nenhuma tela encontrada
            </Typography>
          ) : (
            groups.map((group) => (
              <Box key={group.name}>
                <Typography
                  variant="overline"
                  sx={{
                    display: 'block',
                    px: 2,
                    pt: 1,
                    pb: 0,
                    color: 'text.disabled',
                    fontSize: '0.6rem',
                    letterSpacing: '0.08em',
                    lineHeight: '20px',
                  }}
                >
                  {group.name}
                </Typography>
                {group.pages.map((page) => {
                  const Icon = page.icon;
                  const active =
                    pathname === page.path ||
                    (page.path !== '/' && pathname.startsWith(page.path));

                  return (
                    <ListItemButton
                      key={page.path}
                      onClick={() => handleNav(page.path)}
                      selected={active}
                      dense
                      sx={{
                        mx: 0.5,
                        borderRadius: 1.5,
                        py: 0.5,
                        minHeight: 40,
                        ...(active && {
                          bgcolor: (theme) =>
                            alpha(theme.palette.primary.main, 0.08),
                          '&.Mui-selected': {
                            bgcolor: (theme) =>
                              alpha(theme.palette.primary.main, 0.08),
                          },
                          '&.Mui-selected:hover': {
                            bgcolor: (theme) =>
                              alpha(theme.palette.primary.main, 0.12),
                          },
                        }),
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <Icon
                          sx={{
                            fontSize: 18,
                            color: active ? 'primary.main' : 'text.secondary',
                          }}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={page.label}
                        secondary={query.trim() ? page.description : undefined}
                        primaryTypographyProps={{
                          fontWeight: active ? 700 : 500,
                          fontSize: 13,
                          color: active ? 'primary.main' : 'text.primary',
                        }}
                        secondaryTypographyProps={{
                          fontSize: 11,
                          color: 'text.secondary',
                          noWrap: true,
                        }}
                      />
                      {active && (
                        <Box
                          sx={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            bgcolor: 'primary.main',
                            flexShrink: 0,
                          }}
                        />
                      )}
                    </ListItemButton>
                  );
                })}
              </Box>
            ))
          )}
        </Box>

        {/* Dev + API indicators */}
        <Box
          sx={{
            borderTop: '1px solid',
            borderColor: 'divider',
            py: 1,
            px: 2,
            display: 'flex',
            gap: 1,
            alignItems: 'center',
          }}
        >
          <DevIndicator />
          <ApiStatusIndicator />
        </Box>
      </Drawer>
    </>
  );
}
