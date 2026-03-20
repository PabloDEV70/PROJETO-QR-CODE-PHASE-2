import { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Stack } from '@mui/material';
import { publicApi } from '@/api/client';

interface HealthStatus {
  microSankhya: 'ok' | 'error' | 'loading';
  apiMother: 'ok' | 'error' | 'loading';
}

export function HomePage() {
  const [health, setHealth] = useState<HealthStatus>({
    microSankhya: 'loading',
    apiMother: 'loading',
  });

  useEffect(() => {
    publicApi
      .get('/health/deep', { timeout: 10000 })
      .then(({ data }) => {
        const motherOk =
          data?.apiMother?.status === 'reachable' ||
          data?.apiMother?.status === 'connected';
        setHealth({
          microSankhya: 'ok',
          apiMother: motherOk ? 'ok' : 'error',
        });
      })
      .catch(() => {
        setHealth({ microSankhya: 'error', apiMother: 'error' });
      });
  }, []);

  const allOk = health.microSankhya === 'ok' && health.apiMother === 'ok';
  const loading = health.microSankhya === 'loading';

  const brandColor = loading ? '#9E9E9E' : allOk ? '#1B5E20' : '#E65100';
  const subColor = loading ? '#BDBDBD' : allOk ? '#66BB6A' : '#FF8A65';

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: loading
          ? '#FAFAFA'
          : allOk
            ? 'linear-gradient(180deg, #E8F5E9 0%, #F5F7FA 50%, #FAFAFA 100%)'
            : 'linear-gradient(180deg, #FBE9E7 0%, #F5F7FA 50%, #FAFAFA 100%)',
        px: 3,
        transition: 'background 0.6s ease',
      }}
    >
      {/* Logo */}
      <Typography
        sx={{
          fontFamily: "'STOP', 'Arial Black', sans-serif",
          fontSize: { xs: 48, sm: 64 },
          fontWeight: 400,
          letterSpacing: { xs: '0.08em', sm: '0.1em' },
          color: brandColor,
          lineHeight: 1,
          transition: 'color 0.6s ease',
          textAlign: 'center',
        }}
      >
        GIGANTAO
      </Typography>

      {/* Subtitulo */}
      <Typography
        sx={{
          fontSize: { xs: 10, sm: 13 },
          letterSpacing: { xs: 2, sm: 3 },
          color: subColor,
          fontWeight: 600,
          mt: 0.5,
          transition: 'color 0.6s ease',
          textAlign: 'center',
        }}
      >
        ENGENHARIA DE MOVIMENTACAO
      </Typography>

      {/* Status indicators */}
      <Stack spacing={1} sx={{ mt: 5, alignItems: 'center' }}>
        {loading ? (
          <CircularProgress size={24} sx={{ color: '#9E9E9E' }} />
        ) : (
          <>
            <StatusDot label="API Micro Sankhya" status={health.microSankhya} />
            <StatusDot label="API Mother" status={health.apiMother} />
          </>
        )}
      </Stack>

      {/* Footer */}
      <Typography
        sx={{
          position: 'absolute',
          bottom: 24,
          fontSize: 11,
          color: allOk ? '#A5D6A7' : '#BDBDBD',
          fontWeight: 500,
          letterSpacing: 0.5,
        }}
      >
        publico.gigantao.net &middot; v{__APP_VERSION__}
      </Typography>
    </Box>
  );
}

function StatusDot({ label, status }: { label: string; status: 'ok' | 'error' | 'loading' }) {
  const color = status === 'ok' ? '#4CAF50' : status === 'error' ? '#E65100' : '#9E9E9E';

  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Box
        sx={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          bgcolor: color,
          boxShadow: status === 'ok'
            ? '0 0 6px rgba(76,175,80,0.5)'
            : status === 'error'
              ? '0 0 6px rgba(230,81,0,0.5)'
              : 'none',
          transition: 'all 0.4s ease',
        }}
      />
      <Typography
        sx={{
          fontSize: 12,
          color: status === 'ok' ? '#66BB6A' : status === 'error' ? '#E65100' : '#9E9E9E',
          fontWeight: 500,
          transition: 'color 0.4s ease',
        }}
      >
        {label}
      </Typography>
    </Stack>
  );
}
