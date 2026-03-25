import { Box, Typography } from '@mui/material';
import type SvgIcon from '@mui/material/SvgIcon';

interface PageLayoutProps {
  title: string;
  subtitle?: string;
  icon?: typeof SvgIcon;
  children: React.ReactNode;
}

export function PageLayout({ title, subtitle, icon: Icon, children }: PageLayoutProps) {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        {Icon && <Icon sx={{ fontSize: 32, color: 'primary.main' }} />}
        <Box>
          <Typography variant="h5">{title}</Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>
      {children}
    </Box>
  );
}
