import { forwardRef } from 'react';
import MuiButton from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import type { ButtonProps } from './button.types';

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'contained',
      size = 'md',
      color = 'primary',
      isLoading = false,
      fullWidth = false,
      startIcon,
      endIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const sizeMap: Record<string, 'small' | 'medium' | 'large'> = {
      xs: 'small',
      sm: 'small',
      md: 'medium',
      lg: 'large',
      xl: 'large',
    };

    return (
      <MuiButton
        ref={ref}
        variant={variant === 'ghost' ? 'text' : variant}
        size={sizeMap[size]}
        color={color}
        fullWidth={fullWidth}
        disabled={disabled || isLoading}
        startIcon={
          isLoading ? (
            <CircularProgress size={16} color="inherit" sx={{ ml: 1 }} />
          ) : (
            startIcon
          )
        }
        endIcon={!isLoading ? endIcon : undefined}
        {...props}
      >
        {children}
      </MuiButton>
    );
  }
);

Button.displayName = 'Button';
