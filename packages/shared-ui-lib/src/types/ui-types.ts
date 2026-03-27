import type { ReactNode } from 'react';

export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type Color = 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
export type Variant = 'text' | 'outlined' | 'contained' | 'ghost';

export interface BaseProps {
  className?: string;
  style?: React.CSSProperties;
  children?: ReactNode;
}

export interface WithChildren {
  children: ReactNode;
}

export interface WithLabel {
  label?: string;
}

export interface WithPlaceholder {
  placeholder?: string;
}

export interface WithValue<T> {
  value?: T;
  onChange?: (value: T) => void;
}

export interface WithError {
  error?: string;
  helperText?: string;
}

export interface WithDisabled {
  disabled?: boolean;
}

export interface WithRequired {
  required?: boolean;
}

export interface WithLoading {
  isLoading?: boolean;
}

export interface WithOnClick {
  onClick?: () => void;
}

export interface IconProps {
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
}

export interface OpenableState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  title?: string;
  duration?: number;
}
