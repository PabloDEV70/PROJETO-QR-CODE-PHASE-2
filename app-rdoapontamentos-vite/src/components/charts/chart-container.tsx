import { Paper, Typography, Box, Skeleton } from '@mui/material';
import type { ReactNode } from 'react';

interface ChartContainerProps {
  title: string;
  subtitle?: string;
  height?: number;
  isLoading?: boolean;
  children: ReactNode;
  action?: ReactNode;
}

export function ChartContainer({
  title, subtitle, height = 300, isLoading, children, action,
}: ChartContainerProps) {
  return (
    <Paper sx={{ p: { xs: 1.5, sm: 2.5 }, height: '100%' }}>
      <Box sx={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', mb: 2,
      }}>
        <Box>
          <Typography variant="subtitle1" fontWeight="bold">
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        {action}
      </Box>
      {isLoading ? (
        <Skeleton variant="rounded" height={height} />
      ) : (
        <Box sx={{ width: '100%', height, maxWidth: '100%', overflow: 'hidden' }}>{children}</Box>
      )}
    </Paper>
  );
}
