import { Box, Typography, Button, Grid } from '@mui/material';
import { ContentCopy } from '@mui/icons-material';

interface RecoveryCodesDisplayProps {
  codes: string[];
}

export function RecoveryCodesDisplay({ codes }: RecoveryCodesDisplayProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(codes.join('\n'));
  };

  return (
    <Box>
      <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
        Codigos de recuperacao
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Guarde estes codigos em um local seguro. Cada codigo so pode ser usado uma vez.
      </Typography>

      <Grid container spacing={1} sx={{ mb: 2 }}>
        {codes.map((code) => (
          <Grid key={code} size={{ xs: 6 }}>
            <Box
              sx={{
                fontFamily: 'monospace',
                fontSize: '0.9rem',
                textAlign: 'center',
                py: 0.5,
                bgcolor: 'action.hover',
                borderRadius: 1,
              }}
            >
              {code}
            </Box>
          </Grid>
        ))}
      </Grid>

      <Button
        variant="outlined"
        size="small"
        startIcon={<ContentCopy />}
        onClick={handleCopy}
        fullWidth
      >
        Copiar todos
      </Button>
    </Box>
  );
}
