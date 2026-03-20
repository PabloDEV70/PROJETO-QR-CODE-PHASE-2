import { Paper, Stack, Typography, Chip } from '@mui/material';
import { DirectionsCar } from '@mui/icons-material';

interface RdoVeiculoCardProps {
  placa: string | null;
  modelo: string | null;
  tag?: string | null;
}

export function RdoVeiculoCard({ placa, modelo, tag }: RdoVeiculoCardProps) {
  if (!placa) return null;

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
      <Stack direction="row" spacing={2} alignItems="center">
        <DirectionsCar sx={{ color: 'primary.main', fontSize: 28 }} />
        <Stack spacing={0.25} sx={{ flex: 1 }}>
          <Typography variant="subtitle2" fontWeight={600}>
            {placa.trim()}
          </Typography>
          {modelo && (
            <Typography variant="caption" color="text.secondary">
              {modelo.trim()}
            </Typography>
          )}
        </Stack>
        {tag && (
          <Chip label={`Tag: ${tag.trim()}`} size="small" variant="outlined" />
        )}
      </Stack>
    </Paper>
  );
}
