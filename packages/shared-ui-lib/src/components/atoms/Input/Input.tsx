import { forwardRef } from 'react';
import MuiTextField from '@mui/material/TextField';

interface SharedInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
  fullWidth?: boolean;
  name?: string;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  type?: string;
  autoFocus?: boolean;
  size?: 'small' | 'medium';
}

export type InputProps = SharedInputProps;

export const Input = forwardRef<HTMLInputElement, SharedInputProps>(
  (
    {
      label,
      error,
      helperText,
      startAdornment,
      endAdornment,
      fullWidth = false,
      ...props
    },
    ref
  ) => {
    return (
      <MuiTextField
        ref={ref}
        label={label}
        error={!!error}
        helperText={error || helperText}
        fullWidth={fullWidth}
        slotProps={{
          input: {
            startAdornment,
            endAdornment,
          },
        }}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
