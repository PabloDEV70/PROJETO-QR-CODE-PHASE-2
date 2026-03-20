import { useState, useCallback, useMemo } from 'react';
import { Avatar, type AvatarProps } from '@mui/material';
import {
  getFuncionarioFotoUrl,
  getFuncionarioFotoByCodfuncUrl,
} from '@/api/funcionarios';

export interface FuncionarioAvatarProps extends Omit<AvatarProps, 'src' | 'children'> {
  codparc?: number | null;
  codemp?: number;
  codfunc?: number;
  nome?: string;
  showFoto?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const sizeMap = { small: 32, medium: 40, large: 56 };

export function FuncionarioAvatar({
  codparc,
  codemp,
  codfunc,
  nome,
  showFoto = true,
  size = 'medium',
  sx,
  ...props
}: FuncionarioAvatarProps) {
  const [imageError, setImageError] = useState(false);
  const dimension = sizeMap[size];
  const initial = nome?.charAt(0).toUpperCase() || 'F';

  const handleImageError = useCallback(() => setImageError(true), []);

  const fotoUrl = useMemo(() => {
    if (codparc) return getFuncionarioFotoUrl(codparc);
    if (codemp && codfunc) return getFuncionarioFotoByCodfuncUrl(codemp, codfunc);
    return null;
  }, [codparc, codemp, codfunc]);

  const avatarStyles = {
    width: dimension,
    height: dimension,
    bgcolor: 'primary.main',
    fontSize: size === 'large' ? 28 : size === 'small' ? 14 : 18,
    ...sx,
  };

  if (!showFoto || imageError || !fotoUrl) {
    return <Avatar sx={avatarStyles} {...props}>{initial}</Avatar>;
  }

  return (
    <Avatar
      src={fotoUrl}
      alt={nome || `Funcionario ${codparc || codfunc}`}
      sx={avatarStyles}
      slotProps={{ img: { onError: handleImageError } }}
      {...props}
    >
      {initial}
    </Avatar>
  );
}
