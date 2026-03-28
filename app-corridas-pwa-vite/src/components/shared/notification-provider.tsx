import { Snackbar, Alert, Stack } from '@mui/material';
import { useNotificationStore } from '@/stores/notification-store';

export function NotificationProvider() {
  const toasts = useNotificationStore((s) => s.toasts);
  const removeToast = useNotificationStore((s) => s.removeToast);

  return (
    <Stack
      spacing={1}
      sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 2000 }}
    >
      {toasts.map((t) => (
        <Snackbar
          key={t.id}
          open
          autoHideDuration={5000}
          onClose={() => removeToast(t.id)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          sx={{ position: 'static' }}
        >
          <Alert
            severity={t.severity}
            variant="filled"
            onClose={() => removeToast(t.id)}
            sx={{ minWidth: 280 }}
          >
            {t.message}
          </Alert>
        </Snackbar>
      ))}
    </Stack>
  );
}
