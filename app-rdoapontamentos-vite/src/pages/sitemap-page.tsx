import { useMemo } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box, Typography, List, ListItem, ListItemIcon, ListItemText,
  Paper, Chip, alpha, useTheme,
} from '@mui/material';
import { Lock } from '@mui/icons-material';
import { pagesConfig } from '@/components/layout/pages-config';

const GROUP_ORDER = ['Apontamentos', 'Desempenho', 'Administracao', 'Sistema'];

export default function SitemapPage() {
  const theme = useTheme();

  const grouped = useMemo(() => {
    const map = new Map<string, typeof pagesConfig>();
    for (const page of pagesConfig) {
      if (page.path === '/sitemap') continue;
      const group = page.group;
      if (!map.has(group)) map.set(group, []);
      map.get(group)!.push(page);
    }
    return GROUP_ORDER
      .filter((g) => map.has(g))
      .map((g) => ({ group: g, pages: map.get(g)! }));
  }, []);

  const isDynamic = (path: string) => path.includes(':');

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Mapa do App
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Todas as telas disponiveis na aplicacao
      </Typography>

      {grouped.map(({ group, pages }) => (
        <Paper
          key={group}
          variant="outlined"
          sx={{ mb: 2, borderRadius: 2, overflow: 'hidden' }}
        >
          <Box
            sx={{
              px: 2, py: 1,
              bgcolor: alpha(theme.palette.primary.main, 0.08),
              borderBottom: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography variant="subtitle2" fontWeight={700} color="primary">
              {group}
            </Typography>
          </Box>

          <List dense disablePadding>
            {pages.map((page) => {
              const Icon = page.icon;
              const dynamic = isDynamic(page.path);

              return (
                <ListItem
                  key={page.path}
                  component={dynamic ? 'div' : RouterLink}
                  {...(!dynamic && { to: page.path })}
                  sx={{
                    pl: page.parent ? 5 : 2,
                    opacity: dynamic ? 0.5 : 1,
                    textDecoration: 'none',
                    color: 'inherit',
                    '&:hover': dynamic ? {} : {
                      bgcolor: alpha(theme.palette.primary.main, 0.04),
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Icon fontSize="small" color={dynamic ? 'disabled' : 'primary'} />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" fontWeight={600}>
                          {page.label}
                        </Typography>
                        {page.adminOnly && (
                          <Chip
                            icon={<Lock sx={{ fontSize: 12 }} />}
                            label="Admin"
                            size="small"
                            color="warning"
                            variant="outlined"
                            sx={{ height: 20, '& .MuiChip-label': { px: 0.5, fontSize: 11 } }}
                          />
                        )}
                        <Typography
                          variant="caption"
                          color="text.disabled"
                          sx={{ fontFamily: 'monospace' }}
                        >
                          {page.path}
                        </Typography>
                      </Box>
                    }
                    secondary={page.description}
                  />
                </ListItem>
              );
            })}
          </List>
        </Paper>
      ))}
    </Box>
  );
}
