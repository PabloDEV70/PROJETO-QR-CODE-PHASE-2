import { useState, useCallback, useMemo } from 'react';
import { Avatar, type AvatarProps } from '@mui/material';
import { getApiBaseUrl } from '@/api/client';
import { useAuthStore } from '@/stores/auth-store';

export interface FuncionarioAvatarProps extends Omit<AvatarProps, 'src' | 'children'> {
  codparc?: number | null;
  nome?: string;
  size?: 'small' | 'medium' | 'large';
}

const sizeMap = { small: 28, medium: 36, large: 52 };

export function FuncionarioAvatar({
  codparc,
  nome,
  size = 'medium',
  sx,
  ...props
}: FuncionarioAvatarProps) {
  const [imageError, setImageError] = useState(false);
  const dimension = sizeMap[size];
  const initial = nome?.charAt(0).toUpperCase() || '?';

  const handleImageError = useCallback(() => setImageError(true), []);

  const fotoUrl = useMemo(() => {
    if (!codparc) return null;
    const baseUrl = getApiBaseUrl();
    const token = useAuthStore.getState().user?.token ?? '';
    return `${baseUrl}/funcionarios/${codparc}/foto?token=${token}`;
  }, [codparc]);

  const avatarStyles = {
    width: dimension,
    height: dimension,
    bgcolor: 'primary.main',
    fontSize: size === 'large' ? 24 : size === 'small' ? 12 : 16,
    ...sx,
  };

  if (imageError || !fotoUrl) {
    return <Avatar sx={avatarStyles} {...props}>{initial}</Avatar>;
  }

  return (
    <Avatar
      src={fotoUrl}
      alt={nome || `Funcionario ${codparc}`}
      sx={avatarStyles}
      slotProps={{ img: { onError: handleImageError } }}
      {...props}
    >
      {initial}
    </Avatar>
  );
}
