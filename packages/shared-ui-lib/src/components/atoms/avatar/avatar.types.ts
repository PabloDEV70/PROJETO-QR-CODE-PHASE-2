import type { AvatarProps as MuiAvatarProps } from '@mui/material/Avatar';

export interface AvatarProps extends MuiAvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export interface FuncionarioAvatarProps {
  nome: string;
  urlFoto?: string;
  funcao?: string;
  size?: AvatarProps['size'];
  onClick?: () => void;
}
