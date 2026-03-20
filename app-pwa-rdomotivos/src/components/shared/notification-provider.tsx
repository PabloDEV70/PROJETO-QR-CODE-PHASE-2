import { Box, IconButton, Typography, alpha } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useNotificationStore } from '@/stores/notification-store';

const COLORS: Record<string, string> = { error: '#EF4444', warning: '#F59E0B', info: '#3B82F6', success: '#16A34A' };

export function NotificationProvider() {
  const toasts = useNotificationStore((s) => s.toasts);
  const removeToast = useNotificationStore((s) => s.removeToast);
  if (toasts.length === 0) return null;
  return (
    <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1400, display: 'flex', flexDirection: 'column', pointerEvents: 'none' }}>
      {toasts.map((toast) => {
        const color = COLORS[toast.severity] ?? '#3B82F6';
        return (
          <Box key={toast.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 0.75, bgcolor: alpha(color, 0.95), color: '#fff', pointerEvents: 'auto', animation: 'slideDown 250ms ease-out', '@keyframes slideDown': { from: { transform: 'translateY(-100%)' }, to: { transform: 'translateY(0)' } } }}>
            <Typography sx={{ flex: 1, fontSize: '0.8rem', fontWeight: 600 }}>{toast.message}</Typography>
            <IconButton size="small" onClick={() => removeToast(toast.id)} sx={{ color: '#fff', p: 0.25 }}><CloseIcon sx={{ fontSize: 16 }} /></IconButton>
          </Box>
        );
      })}
    </Box>
  );
}
