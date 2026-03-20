import { useState, useMemo } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Box } from '@mui/material';
import { useDeviceStore } from '@/stores/device-store';
import { useSessionStore } from '@/stores/session-store';
import { useColaboradores } from '@/hooks/use-colaboradores';
import { useQuemFaz } from '@/hooks/use-quem-faz';
import { AppHeader } from '@/components/layout/app-header';
import { OfflineBanner } from '@/components/shared/offline-banner';
import { SwUpdatePrompt } from '@/components/shared/sw-update-prompt';

export function TabletShell() {
  const isConfigured = useDeviceStore((s) => s.isConfigured);
  const { activeCodparc, activeNome } = useSessionStore();
  const { departamentos: colabDeps } = useColaboradores();
  const { data: quemFaz } = useQuemFaz();
  const departamentos = useMemo(() => {
    const set = new Set(colabDeps);
    for (const r of quemFaz ?? []) { if (r.departamento) set.add(r.departamento); }
    return [...set].sort();
  }, [colabDeps, quemFaz]);
  const [search, setSearch] = useState('');
  const location = useLocation();

  if (!isConfigured) return <Navigate to="/setup" replace />;

  const isHome = location.pathname === '/' || location.pathname === '/selecionar';
  const breadcrumb = !isHome && activeNome ? `${activeNome} #${activeCodparc}` : undefined;

  return (
    <Box sx={{ height: '100dvh', display: 'flex', flexDirection: 'column', overflow: 'hidden', bgcolor: 'background.default' }}>
      <AppHeader
        showSearch={isHome}
        search={search}
        onSearch={setSearch}
        breadcrumb={breadcrumb}
        departamentos={departamentos}
      />
      <OfflineBanner />
      <Box component="main" sx={{ flex: 1, overflow: 'auto', p: { xs: 1, sm: 1.5 } }}>
        <Outlet context={{ search, setSearch }} />
      </Box>
      <SwUpdatePrompt />
    </Box>
  );
}
