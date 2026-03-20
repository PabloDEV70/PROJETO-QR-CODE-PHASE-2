import { Card, CardContent, Box, Typography, Chip, Skeleton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import type { SvgIconComponent } from '@mui/icons-material';

interface QuickAccessCardProps {
  title: string;
  description: string;
  icon: SvgIconComponent;
  path: string;
  gradient: string;
  badge?: string;
  badgeLoading?: boolean;
}

export function QuickAccessCard({
  title, description, icon: Icon, path, gradient, badge, badgeLoading,
}: QuickAccessCardProps) {
  const navigate = useNavigate();

  return (
    <Card
      onClick={() => navigate(path)}
      sx={{
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 },
      }}
    >
      <Box
        sx={{
          background: gradient,
          p: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
        }}
      >
        <Icon sx={{ color: 'white', fontSize: 32 }} />
        <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, flex: 1 }}>
          {title}
        </Typography>
        {badgeLoading && (
          <Skeleton variant="rounded" width={40} height={24} sx={{ bgcolor: 'rgba(255,255,255,0.3)' }} />
        )}
        {!badgeLoading && badge && (
          <Chip
            label={badge}
            size="small"
            sx={{
              bgcolor: 'rgba(255,255,255,0.25)',
              color: 'white',
              fontWeight: 700,
              fontSize: '0.8rem',
            }}
          />
        )}
      </Box>
      <CardContent>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
}
