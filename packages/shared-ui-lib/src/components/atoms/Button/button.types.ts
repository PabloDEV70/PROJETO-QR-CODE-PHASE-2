import type { ButtonHTMLAttributes, ReactNode } from 'react';
import type { Size, Color, Variant } from '../../../types';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  color?: Color;
  isLoading?: boolean;
  fullWidth?: boolean;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
}

export type ButtonVariant = NonNullable<ButtonProps['variant']>;
export type ButtonSize = NonNullable<ButtonProps['size']>;
export type ButtonColor = NonNullable<ButtonProps['color']>;
