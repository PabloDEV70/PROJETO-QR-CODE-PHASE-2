import type { ReactNode } from 'react';
import type { CardProps as MuiCardProps } from '@mui/material/Card';

export interface CardProps extends MuiCardProps {
  children?: ReactNode;
}

export interface CardHeaderProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  avatar?: ReactNode;
}

export interface CardContentProps {
  children?: ReactNode;
  sx?: object;
}

export interface CardActionsProps {
  children?: ReactNode;
  sx?: object;
}
