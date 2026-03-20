import { Box, Tabs, Tab, Chip } from '@mui/material';
import {
  Circle, Code, Monitor, TableChart, Visibility,
  Settings, Bolt, Functions, MenuBook, Security, Dashboard,
} from '@mui/icons-material';
import { useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';
import { QueryEditor } from '@/components/database/query-editor';
import { MonitorTab } from '@/components/database/monitor-tab';
import { TablesTab } from '@/components/database/tables-tab';
import { CodeObjectsTab } from '@/components/database/code-objects-tab';
import { DictionaryTab } from '@/components/database/dictionary-tab';
import { AuditTab } from '@/components/database/audit-tab';
import { ScreenBuilderTab } from '@/components/database/screen-builder-tab';
import type { DatabaseEnv } from '@/types/auth-types';

const DB_STYLE: Record<DatabaseEnv, { bg: string; color: string; label: string }> = {
  PROD: { bg: '#2e7d3218', color: '#2e7d32', label: 'PRODUCAO' },
  TESTE: { bg: '#ed6c0218', color: '#ed6c02', label: 'TESTE' },
  TREINA: { bg: '#7b1fa218', color: '#7b1fa2', label: 'TREINA' },
};

const TABS = [
  { value: 'query', label: 'Query', icon: <Code fontSize="small" /> },
  { value: 'monitor', label: 'Monitor', icon: <Monitor fontSize="small" /> },
  { value: 'tables', label: 'Tables', icon: <TableChart fontSize="small" /> },
  { value: 'views', label: 'Views', icon: <Visibility fontSize="small" /> },
  { value: 'procedures', label: 'Procedures', icon: <Settings fontSize="small" /> },
  { value: 'triggers', label: 'Triggers', icon: <Bolt fontSize="small" /> },
  { value: 'functions', label: 'Functions', icon: <Functions fontSize="small" /> },
  { value: 'dictionary', label: 'Dicionario', icon: <MenuBook fontSize="small" /> },
  { value: 'audit', label: 'Auditoria', icon: <Security fontSize="small" /> },
  { value: 'telas', label: 'Telas', icon: <Dashboard fontSize="small" /> },
] as const;

type TabKey = (typeof TABS)[number]['value'];

const VALID_TABS = new Set<string>(TABS.map((t) => t.value));

export function DatabasePage() {
  const [params, setParams] = useSearchParams();
  const database = useAuthStore((s) => s.database);
  const rawTab = params.get('tab') ?? 'query';
  // back-compat: old "explorer" → "tables"
  const resolved = rawTab === 'explorer' || rawTab === 'objects' ? 'tables' : rawTab;
  const tab: TabKey = VALID_TABS.has(resolved) ? (resolved as TabKey) : 'query';
  const dbStyle = DB_STYLE[database];

  const setTab = (value: TabKey) => {
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('tab', value);
      ['table', 'q', 'obj', 'eschema', 'etype', 'tsub',
        'dict', 'dq', 'df', 'dt', 'dv', 'dsub', 'at', 'ap',
        'msub', 'mql', 'mq', 'ms', 'tela', 'tq',
      ].forEach((k) => next.delete(k));
      return next;
    }, { replace: true });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)' }}>
      <Box sx={{
        display: 'flex', alignItems: 'center', borderBottom: 1, borderColor: 'divider',
        px: 1.5, flexShrink: 0, bgcolor: 'background.paper',
      }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: 36,
            '& .MuiTabs-indicator': { height: 2 },
            '& .MuiTab-root': {
              minHeight: 36, py: 0, px: 1.5, fontSize: 12,
              textTransform: 'none', fontWeight: 500,
              '&.Mui-selected': { fontWeight: 700 },
            },
          }}
        >
          {TABS.map((t) => (
            <Tab key={t.value} value={t.value} label={t.label}
              icon={t.icon} iconPosition="start" />
          ))}
        </Tabs>
        <Box sx={{ flex: 1 }} />
        <Chip
          icon={<Circle sx={{ fontSize: '8px !important', color: dbStyle.color }} />}
          label={dbStyle.label} size="small"
          sx={{
            height: 22, fontSize: 11, fontWeight: 700, letterSpacing: '0.05em',
            bgcolor: dbStyle.bg, color: dbStyle.color,
            border: `1px solid ${dbStyle.color}40`, mr: 1,
          }}
        />
        <Chip
          label="READ-ONLY" size="small" variant="outlined" color="default"
          sx={{ fontSize: 9, height: 18, opacity: 0.5 }}
        />
      </Box>

      <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden', p: 1 }}>
        {tab === 'query' && <QueryEditor />}
        {tab === 'monitor' && <MonitorTab />}
        {tab === 'tables' && <TablesTab />}
        {tab === 'views' && <CodeObjectsTab type="view" />}
        {tab === 'procedures' && <CodeObjectsTab type="procedure" />}
        {tab === 'triggers' && <CodeObjectsTab type="trigger" />}
        {tab === 'functions' && <CodeObjectsTab type="function" />}
        {tab === 'dictionary' && <DictionaryTab />}
        {tab === 'audit' && <AuditTab />}
        {tab === 'telas' && <ScreenBuilderTab />}
      </Box>
    </Box>
  );
}
