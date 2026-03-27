import { useState, useCallback } from 'react';

export type NotificationSeverity = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  severity: NotificationSeverity;
  message: string;
  autoHide?: number;
}

export function useNotification() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const add = useCallback((severity: NotificationSeverity, message: string, autoHide = 5000) => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
    const notification: Notification = { id, severity, message, autoHide };
    setNotifications((prev) => [...prev, notification]);

    if (autoHide > 0) {
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }, autoHide);
    }

    return id;
  }, []);

  const remove = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const success = useCallback((message: string) => add('success', message), [add]);
  const error = useCallback((message: string) => add('error', message, 8000), [add]);
  const warning = useCallback((message: string) => add('warning', message), [add]);
  const info = useCallback((message: string) => add('info', message), [add]);

  return { notifications, add, remove, success, error, warning, info };
}
