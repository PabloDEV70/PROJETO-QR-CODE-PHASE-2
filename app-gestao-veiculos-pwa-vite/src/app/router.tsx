import { createBrowserRouter } from 'react-router-dom';
import { AppShell } from '@/components/layout/app-shell';
import LoginPage from '@/pages/login-page';
import { DashboardPage } from '@/pages/dashboard-page';
import { VeiculosPage } from '@/pages/veiculos-page';
import { VeiculoDetailPage } from '@/pages/veiculo-detail-page';
import { NovaSituacaoPage } from '@/pages/nova-situacao-page';
import { SituacaoDetailPage } from '@/pages/situacao-detail-page';
import { SituacaoEditPage } from '@/pages/situacao-edit-page';
import { CadeiaNotasPage } from '@/pages/cadeia-notas-page';
import { ConfigPage } from '@/pages/config-page';
import { RegistrosPage } from '@/pages/registros-page';
import { OperadoresPage } from '@/pages/operadores-page';
import { AgendaPage } from '@/pages/agenda-page';
import { AnaliseFrotaPage } from '@/pages/analise-frota-page';
import { AnaliseFrotaDetalhePage } from '@/pages/analise-frota-detalhe-page';

function LimparPage() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f5f5f5', fontFamily: 'sans-serif' }}>
      <div style={{ background: '#fff', padding: '2rem', borderRadius: '8px', textAlign: 'center', maxWidth: '400px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <h2>Limpar Cache</h2>
        <p>Limpar Service Worker, cache e dados locais do app.</p>
        <button onClick={async () => {
          try {
            const regs = await navigator.serviceWorker?.getRegistrations();
            for (const r of regs ?? []) await r.unregister();
            const names = await caches.keys();
            for (const n of names) await caches.delete(n);
            localStorage.clear();
            sessionStorage.clear();
            alert('Tudo limpo! Redirecionando...');
            window.location.href = '/login';
          } catch (e) { alert('Erro: ' + e); }
        }} style={{ background: '#c62828', color: '#fff', border: 'none', padding: '12px 24px', fontSize: '16px', fontWeight: 700, borderRadius: '4px', cursor: 'pointer', marginTop: '16px' }}>
          Limpar Tudo
        </button>
      </div>
    </div>
  );
}

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/limpar', element: <LimparPage /> },
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'veiculos', element: <VeiculosPage /> },
      { path: 'veiculo/:codveiculo', element: <VeiculoDetailPage /> },
      { path: 'nova-situacao', element: <NovaSituacaoPage /> },
      { path: 'situacao/:id', element: <SituacaoDetailPage /> },
      { path: 'situacao/:id/editar', element: <SituacaoEditPage /> },
      { path: 'situacao/:id/notas', element: <CadeiaNotasPage /> },
      { path: 'agenda', element: <AgendaPage /> },
      { path: 'registros', element: <RegistrosPage /> },
      { path: 'operadores', element: <OperadoresPage /> },
      { path: 'analise-frota', element: <AnaliseFrotaPage /> },
      { path: 'analise-frota/:codveiculo', element: <AnaliseFrotaDetalhePage /> },
      { path: 'config', element: <ConfigPage /> },
    ],
  },
]);
