import { useState, useEffect } from 'react';
import { Box, Skeleton } from '@mui/material';
import { Inventory2 } from '@mui/icons-material';
import { apiClient } from '@/api/client';

interface ProdutoThumbProps {
  codProd: number;
  temImagem: number;
  size?: number;
}

export function ProdutoThumb({ codProd, temImagem, size = 56 }: ProdutoThumbProps) {
  const [src, setSrc] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!temImagem) return;
    let revoked = false;

    apiClient.get(`/produtos/${codProd}/imagem`, { responseType: 'blob' })
      .then((res) => {
        if (revoked) return;
        const url = URL.createObjectURL(res.data as Blob);
        setSrc(url);
      })
      .catch(() => {
        if (!revoked) setFailed(true);
      });

    return () => {
      revoked = true;
      if (src) URL.revokeObjectURL(src);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codProd, temImagem]);

  if (!temImagem || failed) {
    return (
      <Box sx={{
        width: size, height: size, flexShrink: 0, borderRadius: 1.5,
        bgcolor: 'action.hover', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Inventory2 sx={{ fontSize: size * 0.45, color: 'text.disabled' }} />
      </Box>
    );
  }

  if (!src) {
    return <Skeleton variant="rounded" width={size} height={size} sx={{ flexShrink: 0, borderRadius: 1.5 }} />;
  }

  return (
    <Box
      component="img"
      src={src}
      alt=""
      onError={() => setFailed(true)}
      sx={{
        width: size, height: size, objectFit: 'cover', borderRadius: 1.5, flexShrink: 0,
      }}
    />
  );
}
