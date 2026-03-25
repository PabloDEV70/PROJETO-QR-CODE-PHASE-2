import { useState } from 'react';
import { Box, Skeleton } from '@mui/material';
import { Inventory2 } from '@mui/icons-material';
import { getApiBaseUrl } from '@/api/client';
import { useAuthStore } from '@/stores/auth-store';

interface ProdutoThumbProps {
  codProd: number;
  size?: number;
}

export function ProdutoThumb({ codProd, size = 52 }: ProdutoThumbProps) {
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading');
  const token = useAuthStore((s) => s.user?.token);
  const base = `${getApiBaseUrl()}/produtos/${codProd}/imagem`;
  const src = token ? `${base}?token=${token}` : base;

  if (status === 'error') {
    return (
      <Box sx={{
        width: size, height: size, flexShrink: 0, borderRadius: 1,
        bgcolor: 'action.hover', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Inventory2 sx={{ fontSize: size * 0.46, color: 'text.disabled' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ width: size, height: size, flexShrink: 0, position: 'relative' }}>
      {status === 'loading' && (
        <Skeleton variant="rounded" width={size} height={size} sx={{ position: 'absolute' }} />
      )}
      <Box
        component="img"
        src={src}
        alt=""
        onLoad={() => setStatus('ok')}
        onError={() => setStatus('error')}
        sx={{
          width: size, height: size, objectFit: 'cover', borderRadius: 1,
          display: status === 'ok' ? 'block' : 'none',
        }}
      />
    </Box>
  );
}
