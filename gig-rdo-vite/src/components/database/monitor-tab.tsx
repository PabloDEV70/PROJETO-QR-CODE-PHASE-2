import {
  Box, Chip, CircularProgress, Alert, Tabs, Tab,
} from '@mui/material';
import { Circle } from '@mui/icons-material';
import { useSearchParams } from 'react-router-dom';
import { useVisaoServidor } from '@/hooks/use-database-monitor';
import { useAuthStore } from '@/stores/auth-store';
import { MonitorLivePanel } from '@/components/database/monitor-live-panel';
import { MonitorHistoryPanel } from '@/components/database/monitor-history-panel';
import { MonitorSessionsPanel } from '@/components/database/monitor-sessions-panel';
import type { DatabaseEnv } from '@/types/auth-types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type R = Record<string, any>;

const DB_STYLE: Record<DatabaseEnv, { bg: string; color: string; label: string }> = {
  PROD: { bg: '#2e7d3218', color: '#2e7d32', label: 'PRODUCAO' },
  TESTE: { bg: '#ed6c0218', color: '#ed6c02', label: 'TESTE' },
  TREINA: { bg: '#7b1fa218', color: '#7b1fa2', label: 'TREINA' },
};

const SUB_TABS = ['live', 'historico', 'sessoes'] as const;
type SubTab = (typeof SUB_TABS)[number];
const VALID_SUBS = new Set<string>(SUB_TABS);

function ServerInfo() {
  const { data, isLoading, error } = useVisaoServidor();
  if (isLoading) return <CircularProgress size={16} />;
  if (error) return (
    <Alert severity="error" sx={{ py: 0, fontSize: 12 }}>
      Servidor — {(error as Error).message}
    </Alert>
  );
  if (!data) return null;
  const d = data as R;

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
      <Chip label={d.nomeServidor ?? d.nome} size="small" sx={{ height: 22, fontSize: 11 }} />
      <Chip label={d.bancoAtual ?? d.versao} size="small" variant="outlined"
        sx={{ height: 22, fontSize: 11 }} />
      <Chip label={`${d.sessoesUsuarioAtivas ?? d.conexoesAtivas ?? '?'} sessoes`}
        size="small" color="primary" variant="outlined" sx={{ height: 22, fontSize: 11 }} />
      <Chip label={`${d.requisicaosAtivas ?? '?'} req ativas`} size="small" variant="outlined"
        sx={{ height: 22, fontSize: 11 }} />
      <Chip label={`${d.conexoesUsuario ?? d.cpuCount ?? '?'} conn`} size="small"
        variant="outlined" sx={{ height: 22, fontSize: 11 }} />
    </Box>
  );
}

export function MonitorTab() {
  const [params, setParams] = useSearchParams();
  const database = useAuthStore((s) => s.database);
  const dbStyle = DB_STYLE[database];
  const rawSub = params.get('msub') ?? 'live';
  const sub: SubTab = VALID_SUBS.has(rawSub) ? (rawSub as SubTab) : 'live';

  const setSub = (value: SubTab) => {
    setParams((p) => {
      const n = new URLSearchParams(p);
      n.set('msub', value);
      ['mql', 'mq', 'ms'].forEach((k) => n.delete(k));
      return n;
    }, { replace: true });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
        <ServerInfo />
        <Chip
          icon={<Circle sx={{ fontSize: '8px !important', color: dbStyle.color }} />}
          label={dbStyle.label} size="small"
          sx={{
            height: 22, fontSize: 11, fontWeight: 700, letterSpacing: '0.05em',
            bgcolor: dbStyle.bg, color: dbStyle.color,
            border: `1px solid ${dbStyle.color}40`, ml: 'auto',
          }}
        />
      </Box>
      <Tabs
        value={sub} onChange={(_, v) => setSub(v)}
        sx={{
          minHeight: 28, flexShrink: 0,
          '& .MuiTabs-indicator': { height: 2 },
          '& .MuiTab-root': {
            minHeight: 28, py: 0, px: 1.5, fontSize: 11,
            textTransform: 'none', fontWeight: 500,
            '&.Mui-selected': { fontWeight: 700 },
          },
        }}
      >
        <Tab value="live" label="Ao Vivo" />
        <Tab value="historico" label="Historico" />
        <Tab value="sessoes" label="Sessoes" />
      </Tabs>
      <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        {sub === 'live' && <MonitorLivePanel />}
        {sub === 'historico' && <MonitorHistoryPanel />}
        {sub === 'sessoes' && <MonitorSessionsPanel />}
      </Box>
    </Box>
  );
}
