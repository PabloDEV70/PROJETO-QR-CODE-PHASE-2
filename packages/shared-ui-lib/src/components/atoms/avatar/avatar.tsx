import MuiAvatar from '@mui/material/Avatar';
import PersonIcon from '@mui/icons-material/Person';
import type { AvatarProps, FuncionarioAvatarProps } from './avatar.types';

const sizeMap = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 56,
  xl: 80,
};

function getInitials(name: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function Avatar({ src, alt, name, size = 'md', ...props }: AvatarProps) {
  const sizeValue = sizeMap[size];

  if (src) {
    return (
      <MuiAvatar
        src={src}
        alt={alt || name}
        sx={{ width: sizeValue, height: sizeValue, ...props.sx }}
        {...props}
      />
    );
  }

  return (
    <MuiAvatar
      sx={{ bgcolor: 'primary.main', width: sizeValue, height: sizeValue, ...props.sx }}
      {...props}
    >
      {name ? getInitials(name) : <PersonIcon sx={{ fontSize: sizeValue * 0.6 }} />}
    </MuiAvatar>
  );
}

export function FuncionarioAvatar({ nome, urlFoto, funcao, size = 'md', onClick }: FuncionarioAvatarProps) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      <Avatar src={urlFoto} name={nome} size={size} />
      <div>
        <div style={{ fontWeight: 500 }}>{nome}</div>
        {funcao && (
          <div style={{ fontSize: 12, color: 'text.secondary' }}>{funcao}</div>
        )}
      </div>
    </div>
  );
}
