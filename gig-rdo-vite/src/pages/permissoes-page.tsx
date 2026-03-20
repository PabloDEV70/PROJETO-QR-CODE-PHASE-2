import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Box, Typography, Tabs, Tab, Paper } from '@mui/material';
import { Security } from '@mui/icons-material';
import { usePermissoesResumo } from '@/hooks/use-permissoes';
import { PermissoesKpiCards } from '@/components/permissoes/permissoes-kpi-cards';
import { PermissoestelaSidebar } from '@/components/permissoes/permissoes-tela-sidebar';
import { PermissoesTelaPanel } from '@/components/permissoes/permissoes-tela-panel';
import { PermissoesGrupoSidebar } from '@/components/permissoes/permissoes-grupo-sidebar';
import { PermissoesGrupoPanel } from '@/components/permissoes/permissoes-grupo-panel';
import { PermissoesUsuarioSidebar } from '@/components/permissoes/permissoes-usuario-sidebar';
import { PermissoesUsuarioPanel } from '@/components/permissoes/permissoes-usuario-panel';

const TAB_KEYS = ['tela', 'grupo', 'usuario'] as const;

function tabFromParam(val: string | null): number {
  const idx = TAB_KEYS.indexOf(val as typeof TAB_KEYS[number]);
  return idx >= 0 ? idx : 0;
}

export function PermissoesPage() {
  const [params, setParams] = useSearchParams();
  const tab = tabFromParam(params.get('tab'));
  const selectedId = params.get('id');

  const { data: resumo, isLoading } = usePermissoesResumo();

  const setTab = useCallback((newTab: number) => {
    setParams({ tab: TAB_KEYS[newTab] || 'tela' }, { replace: true });
  }, [setParams]);

  const setSelectedId = useCallback((id: string | number | null) => {
    setParams((prev) => {
      const n = new URLSearchParams(prev);
      if (id !== null && id !== undefined) {
        n.set('id', String(id));
      } else {
        n.delete('id');
      }
      return n;
    }, { replace: true });
  }, [setParams]);

  const selectedTela = tab === 0 ? selectedId : null;
  const selectedGrupo = tab === 1 && selectedId ? Number(selectedId) : null;
  const selectedUsuario = tab === 2 && selectedId ? Number(selectedId) : null;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)', p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Security color="primary" />
        <Typography variant="h5" fontWeight={700}>
          Permissoes RBAC
        </Typography>
      </Box>

      <PermissoesKpiCards resumo={resumo} isLoading={isLoading} />

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 1 }}>
        <Tab label="Por Tela" />
        <Tab label="Por Grupo" />
        <Tab label="Por Usuario" />
      </Tabs>

      <Paper
        variant="outlined"
        sx={{ flex: 1, display: 'flex', overflow: 'hidden', borderRadius: 2 }}
      >
        <Box sx={{ width: 300, borderRight: 1, borderColor: 'divider', overflow: 'hidden' }}>
          {tab === 0 && (
            <PermissoestelaSidebar
              selectedId={selectedTela}
              onSelect={(id) => setSelectedId(id)}
            />
          )}
          {tab === 1 && (
            <PermissoesGrupoSidebar
              selectedId={selectedGrupo}
              onSelect={(id) => setSelectedId(id)}
            />
          )}
          {tab === 2 && (
            <PermissoesUsuarioSidebar
              selectedId={selectedUsuario}
              onSelect={(id) => setSelectedId(id)}
            />
          )}
        </Box>
        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          {tab === 0 && <PermissoesTelaPanel idAcesso={selectedTela} />}
          {tab === 1 && <PermissoesGrupoPanel codGrupo={selectedGrupo} />}
          {tab === 2 && <PermissoesUsuarioPanel codUsu={selectedUsuario} />}
        </Box>
      </Paper>
    </Box>
  );
}
