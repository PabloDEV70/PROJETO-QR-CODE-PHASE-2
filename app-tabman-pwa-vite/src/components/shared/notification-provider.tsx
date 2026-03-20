import { Snackbar, Alert } from '@mui/material';
import { useNotificationStore } from '@/stores/notification-store';

export function NotificationProvider() {
  const toasts = useNotificationStore((s) => s.toasts);
  const removeToast = useNotificationStore((s) => s.removeToast);

  const current = toasts[0];
  if (!current) return null;

  return (
    <Snackbar
      open
      onClose={() => removeToast(current.id)}
      autoHideDuration={3000}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert
        severity={current.severity}
        variant="filled"
        onClose={() => removeToast(current.id)}
        sx={{ minWidth: 280, fontSize: '0.82rem', fontWeight: 500 }}
      >
        {current.message}
      </Alert>
    </Snackbar>
  );
}
