import type { ReactNode } from 'react';
import type { TypographyProps as MuiTypographyProps } from '@mui/material/Typography';

export type TypographyVariant = MuiTypographyProps['variant'];
export type TypographyColor = MuiTypographyProps['color'];

export interface TypographyProps extends Omit<MuiTypographyProps, 'variant'> {
  variant?: TypographyVariant;
  children?: ReactNode;
}

export interface HeadingProps extends TypographyProps {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}

export interface TextProps extends TypographyProps {
  muted?: boolean;
}

export interface LabelProps extends Omit<TypographyProps, 'variant'> {
  required?: boolean;
}
