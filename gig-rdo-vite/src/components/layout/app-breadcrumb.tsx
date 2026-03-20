import { useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Breadcrumbs, Typography, Box } from '@mui/material';
import { NavigateNext } from '@mui/icons-material';
import { pagesConfig } from '@/components/layout/pages-config';

export function AppBreadcrumb() {
  const { pathname } = useLocation();

  const crumbs = useMemo(() => {
    if (pathname === '/') return [];

    const segments = pathname.split('/').filter(Boolean);
    const result: { label: string; path: string; isLast: boolean }[] = [];

    for (let i = 0; i < segments.length; i++) {
      const path = '/' + segments.slice(0, i + 1).join('/');
      const page = pagesConfig.find((p) => p.path === path);
      const isLast = i === segments.length - 1;
      const label = page?.label || decodeURIComponent(segments[i] ?? '');

      result.push({ label, path, isLast });
    }

    return result;
  }, [pathname]);

  if (crumbs.length === 0) return null;

  return (
    <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 0.5 }}>
      <Typography
        sx={{
          color: 'text.disabled',
          fontSize: '1.1rem',
          fontWeight: 300,
          userSelect: 'none',
          lineHeight: 1,
        }}
      >
        /
      </Typography>
      <Breadcrumbs
        separator={<NavigateNext sx={{ fontSize: 14, color: 'text.disabled' }} />}
        sx={{ '& .MuiBreadcrumbs-ol': { flexWrap: 'nowrap' } }}
      >
        {crumbs.map((crumb) =>
          crumb.isLast ? (
            <Typography
              key={crumb.path}
              variant="caption"
              sx={{
                fontWeight: 600,
                color: 'text.primary',
                fontSize: '0.75rem',
                whiteSpace: 'nowrap',
              }}
              noWrap
            >
              {crumb.label}
            </Typography>
          ) : (
            <Box
              key={crumb.path}
              component={Link}
              to={crumb.path}
              sx={{
                color: 'text.disabled',
                textDecoration: 'none',
                fontSize: '0.75rem',
                whiteSpace: 'nowrap',
                '&:hover': { color: 'primary.main' },
              }}
            >
              {crumb.label}
            </Box>
          ),
        )}
      </Breadcrumbs>
    </Box>
  );
}
