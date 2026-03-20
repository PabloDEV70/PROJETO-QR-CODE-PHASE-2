import { Navigate } from 'react-router-dom';
import { useDeviceStore } from '@/stores/device-store';
import { SetupLogin } from '@/components/setup/setup-login';

export function SetupPage() {
  const isConfigured = useDeviceStore((s) => s.isConfigured);

  if (isConfigured) {
    return <Navigate to="/" replace />;
  }

  return <SetupLogin />;
}
