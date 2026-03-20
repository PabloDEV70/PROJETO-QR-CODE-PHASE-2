import type { ReactNode } from 'react';
import { Chip } from '@mui/material';

export interface StatusChipProps {
  label: string;
  color: 'success' | 'warning' | 'error' | 'info' | 'default';
  size?: 'small' | 'medium';
  icon?: ReactNode;
  variant?: 'filled' | 'outlined';
}

export function StatusChip({
  label,
  color,
  size = 'small',
  icon,
  variant = 'filled',
}: StatusChipProps) {
  return (
    <Chip
      label={label}
      color={color}
      size={size}
      icon={icon as React.ReactElement | undefined}
      variant={variant}
      sx={{ fontWeight: 600 }}
    />
  );
}
