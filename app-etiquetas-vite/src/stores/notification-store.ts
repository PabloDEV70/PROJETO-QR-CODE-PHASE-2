import { create } from 'zustand';
import type { AlertColor } from '@mui/material';

export interface ToastItem {
  id: number;
  severity: AlertColor;
  message: string;
}

interface NotificationState {
  toasts: ToastItem[];
  addToast: (severity: AlertColor, message: string) => void;
  removeToast: (id: number) => void;
}

let nextId = 1;

export const useNotificationStore = create<NotificationState>()((set) => ({
  toasts: [],
  addToast: (severity, message) => {
    const id = nextId++;
    set((s) => ({ toasts: [...s.toasts, { id, severity, message }] }));
  },
  removeToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
