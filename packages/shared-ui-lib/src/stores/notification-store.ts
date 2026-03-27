import { create } from 'zustand';
import type { Notification } from '../types';

export interface NotificationState {
  notifications: Notification[];
}

interface NotificationActions {
  add: (notification: Omit<Notification, 'id'>) => string;
  remove: (id: string) => void;
  clear: () => void;
  success: (message: string, title?: string) => string;
  error: (message: string, title?: string) => string;
  warning: (message: string, title?: string) => string;
  info: (message: string, title?: string) => string;
}

function generateId(): string {
  return `notif_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export const createNotificationStore = () => {
  return create<NotificationState & NotificationActions>((set, get) => ({
    notifications: [],

    add: (notification) => {
      const id = generateId();
      const newNotification: Notification = {
        ...notification,
        id,
        duration: notification.duration ?? 5000,
      };

      set((state) => ({
        notifications: [...state.notifications, newNotification],
      }));

      if (newNotification.duration && newNotification.duration > 0) {
        setTimeout(() => {
          get().remove(id);
        }, newNotification.duration);
      }

      return id;
    },

    remove: (id) => {
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      }));
    },

    clear: () => set({ notifications: [] }),

    success: (message, title) => {
      return get().add({ type: 'success', message, title });
    },

    error: (message, title) => {
      return get().add({ type: 'error', message, title, duration: 8000 });
    },

    warning: (message, title) => {
      return get().add({ type: 'warning', message, title });
    },

    info: (message, title) => {
      return get().add({ type: 'info', message, title });
    },
  }));
};

export type NotificationStore = ReturnType<typeof createNotificationStore>;
export type { NotificationActions };
