import { Box, CircularProgress, Typography } from '@mui/material';

interface LoadingSkeletonProps {
  message?: string;
}

export function LoadingSkeleton({ message = 'Carregando...' }: LoadingSkeletonProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 8, gap: 2 }}>
      <CircularProgress size={32} />
      <Typography variant="body2" color="text.secondary">{message}</Typography>
    </Box>
  );
}
