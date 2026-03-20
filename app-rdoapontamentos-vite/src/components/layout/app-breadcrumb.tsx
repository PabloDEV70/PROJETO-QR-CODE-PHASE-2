import { useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Breadcrumbs, Box, Chip, alpha, useTheme } from '@mui/material';
import { NavigateNext, Home } from '@mui/icons-material';
import { pagesConfig } from '@/components/layout/pages-config';

export function AppBreadcrumb() {
  const { pathname } = useLocation();
  const theme = useTheme();

  const crumbs = useMemo(() => {
    if (pathname === '/') return [];

    const segments = pathname.split('/').filter(Boolean);
    const result: { label: string; path: string; icon?: typeof Home; isLast: boolean }[] = [];

    for (let i = 0; i < segments.length; i++) {
      const path = '/' + segments.slice(0, i + 1).join('/');

      // Try exact match first, then pattern match for :params
      let page = pagesConfig.find((p) => p.path === path);
      if (!page) {
        const pattern = '/' + segments.slice(0, i).join('/') + '/:';
        page = pagesConfig.find((p) => p.path.startsWith(pattern));
      }

      const isLast = i === segments.length - 1;
      const label = page?.label || decodeURIComponent(segments[i] ?? '');
      const icon = i === 0 && !page ? undefined : page?.icon;

      result.push({ label, path, icon, isLast });
    }

    return result;
  }, [pathname]);

  if (crumbs.length === 0) return null;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <Box
        component={Link}
        to="/"
        sx={{
          display: 'flex', alignItems: 'center',
          color: 'text.disabled', textDecoration: 'none',
          '&:hover': { color: 'primary.main' },
        }}
      >
        <Home sx={{ fontSize: 16 }} />
      </Box>

      <NavigateNext sx={{ fontSize: 14, color: 'text.disabled' }} />

      <Breadcrumbs
        separator={<NavigateNext sx={{ fontSize: 14, color: 'text.disabled' }} />}
        sx={{
          '& .MuiBreadcrumbs-ol': { flexWrap: 'nowrap' },
          '& .MuiBreadcrumbs-separator': { mx: 0.5 },
        }}
      >
        {crumbs.map((crumb) => {
          const Icon = crumb.icon;
          if (crumb.isLast) {
            return (
              <Chip
                key={crumb.path}
                icon={Icon ? <Icon sx={{ fontSize: '14px !important' }} /> : undefined}
                label={crumb.label}
                size="small"
                sx={{
                  height: 22, fontWeight: 600, fontSize: 12,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: 'primary.main',
                  '& .MuiChip-icon': { color: 'primary.main' },
                  '& .MuiChip-label': { px: 0.75 },
                }}
              />
            );
          }
          return (
            <Box
              key={crumb.path}
              component={Link}
              to={crumb.path}
              sx={{
                display: 'flex', alignItems: 'center', gap: 0.5,
                color: 'text.disabled', textDecoration: 'none',
                fontSize: 12, whiteSpace: 'nowrap',
                '&:hover': { color: 'primary.main' },
              }}
            >
              {Icon && <Icon sx={{ fontSize: 14 }} />}
              {crumb.label}
            </Box>
          );
        })}
      </Breadcrumbs>
    </Box>
  );
}
