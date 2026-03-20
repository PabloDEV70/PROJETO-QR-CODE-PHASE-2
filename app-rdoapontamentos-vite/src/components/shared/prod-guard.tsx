import type { ReactNode } from 'react';
import { Alert } from '@mui/material';
import { useAuthStore } from '@/stores/auth-store';

export interface ProdGuardProps {
  children: ReactNode;
  action?: string;
}

export function ProdGuard({ children, action }: ProdGuardProps) {
  const database = useAuthStore((s) => s.database);
  const isDev = import.meta.env.DEV;

  if (database === 'PROD' && isDev) {
    const actionText = action ? ` (${action})` : '';
    return (
      <Alert severity="warning">
        Escrita em PROD bloqueada em modo dev{actionText}.
        Selecione TREINA ou TESTE para continuar.
      </Alert>
    );
  }

  return <>{children}</>;
}
