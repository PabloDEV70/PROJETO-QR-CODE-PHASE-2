import { Box, Stack, Typography } from '@mui/material';

interface FontWeight {
  value: number;
  label: string;
}

interface FontSpecimenProps {
  family: string;
  weights: FontWeight[];
}

const SIZES = [12, 16, 20, 24, 32, 48, 64] as const;

const ALPHABET =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ\nabcdefghijklmnopqrstuvwxyz\n0123456789 !@#$%^&*()_+-=[]{}|;:\'",.<>?/`~';

const SAMPLE_TEXT = 'Ao vivo no campo — manutencao industrial com eficiencia.';

const CODE_SAMPLE = `function calcProd(min: number, total: number) {
  if (total === 0) return 0;
  return Math.round((min / total) * 100);
}`;

export function FontSpecimen({ family, weights }: FontSpecimenProps) {
  return (
    <Stack spacing={3}>
      {/* Escala de tamanhos */}
      <Box>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
          Escala de Tamanhos
        </Typography>
        <Stack spacing={1}>
          {SIZES.map((size) => (
            <Box key={size} sx={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
              <Typography
                variant="caption"
                sx={{ color: 'text.disabled', width: 36, flexShrink: 0, textAlign: 'right' }}
              >
                {size}px
              </Typography>
              <Box sx={{ fontFamily: family, fontSize: size, fontWeight: 400, lineHeight: 1.3 }}>
                Gigantao
              </Box>
            </Box>
          ))}
        </Stack>
      </Box>

      {/* Pesos */}
      {weights.length > 1 && (
        <Box>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            Pesos
          </Typography>
          <Stack spacing={1}>
            {weights.map((w) => (
              <Box key={w.value} sx={{ fontFamily: family, fontSize: 18, fontWeight: w.value }}>
                {w.label} ({w.value}): {SAMPLE_TEXT}
              </Box>
            ))}
          </Stack>
        </Box>
      )}

      {/* Texto de exemplo */}
      <Box>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
          Texto de Exemplo (24px)
        </Typography>
        <Box sx={{ fontFamily: family, fontSize: 24, fontWeight: 400, lineHeight: 1.4 }}>
          {SAMPLE_TEXT}
        </Box>
      </Box>

      {/* Alfabeto */}
      <Box>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
          Alfabeto Completo
        </Typography>
        <Box
          component="pre"
          sx={{
            fontFamily: family,
            fontSize: 14,
            fontWeight: 400,
            lineHeight: 1.8,
            m: 0,
            whiteSpace: 'pre-wrap',
          }}
        >
          {ALPHABET}
        </Box>
      </Box>

      {/* Codigo (so para monospace) */}
      {family.includes('monospace') && (
        <Box>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            Amostra de Codigo
          </Typography>
          <Box
            component="pre"
            sx={{
              fontFamily: family,
              fontSize: 13,
              lineHeight: 1.7,
              m: 0,
              p: 2,
              bgcolor: 'action.hover',
              borderRadius: 1,
              overflowX: 'auto',
            }}
          >
            {CODE_SAMPLE}
          </Box>
        </Box>
      )}
    </Stack>
  );
}
