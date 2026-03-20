import { Box, Typography } from '@mui/material';
import { People } from '@mui/icons-material';

export function OperadoresPage() {
  return (
    <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Box sx={{ textAlign: 'center' }}>
        <People sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
        <Typography sx={{ fontSize: 18, fontWeight: 700, color: 'text.disabled' }}>Equipe</Typography>
        <Typography sx={{ fontSize: 12, color: 'text.disabled' }}>Em desenvolvimento</Typography>
      </Box>
    </Box>
  );
}
