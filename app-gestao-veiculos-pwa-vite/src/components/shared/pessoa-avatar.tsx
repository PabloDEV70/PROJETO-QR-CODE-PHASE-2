import { useState, useCallback, useMemo } from 'react';
import { Avatar, type SxProps } from '@mui/material';
import { getUsuarioFotoUrl } from '@/api/usuarios';

interface Props {
  codparc?: number | null;
  nome?: string;
  size?: number;
  sx?: SxProps;
}

export function PessoaAvatar({ codparc, nome, size = 32, sx }: Props) {
  const [error, setError] = useState(false);
  const handleError = useCallback(() => setError(true), []);
  const initial = nome?.charAt(0).toUpperCase() || '?';

  const src = useMemo(() => {
    if (!codparc || error) return undefined;
    return getUsuarioFotoUrl(codparc) ?? undefined;
  }, [codparc, error]);

  return (
    <Avatar
      src={src}
      alt={nome}
      sx={{ width: size, height: size, fontSize: size * 0.45, bgcolor: 'primary.main', ...sx }}
      slotProps={{ img: { onError: handleError, loading: 'lazy' } }}
    >
      {initial}
    </Avatar>
  );
}
