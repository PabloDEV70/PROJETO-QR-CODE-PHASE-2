import { Box, Skeleton } from '@mui/material';

export function LoadingSkeleton() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Skeleton variant="circular" width={48} height={48} />
        <Skeleton variant="text" width={200} height={32} />
      </Box>
      <Skeleton variant="rounded" height={120} />
      <Skeleton variant="rounded" height={200} />
    </Box>
  );
}
