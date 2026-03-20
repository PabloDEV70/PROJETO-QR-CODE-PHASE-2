import { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, IconButton, Tabs, Tab,
  Box, Typography, Stack, Chip, LinearProgress,
} from '@mui/material';
import { Close, Circle, Refresh } from '@mui/icons-material';
import { useApiHealth, type DeepHealthData } from '@/hooks/use-api-health';
import { useQueryClient } from '@tanstack/react-query';

interface ApiHealthDialogProps {
  open: boolean;
  onClose: () => void;
}

export function ApiHealthDialog({ open, onClose }: ApiHealthDialogProps) {
  const { isOnline, data } = useApiHealth();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState(0);

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['api-health-deep'] });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1 }}>
        <Circle sx={{ fontSize: 10, color: isOnline ? 'success.main' : 'error.main' }} />
        <Typography variant="h6" sx={{ fontWeight: 700, flex: 1 }}>
          Status do Sistema
        </Typography>
        <IconButton size="small" onClick={handleRefresh} title="Atualizar">
          <Refresh sx={{ fontSize: 20 }} />
        </IconButton>
        <IconButton size="small" onClick={onClose}>
          <Close sx={{ fontSize: 20 }} />
        </IconButton>
      </DialogTitle>

      {!isOnline ? (
        <OfflineContent />
      ) : (
        <>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            sx={{ px: 3, borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="API Micro Sankhya" sx={{ textTransform: 'none', fontWeight: 600 }} />
            <Tab label="API Mother" sx={{ textTransform: 'none', fontWeight: 600 }} />
          </Tabs>
          <DialogContent sx={{ pt: 2.5, minHeight: 300 }}>
            {tab === 0 && <ApiMicroTab data={data!} />}
            {tab === 1 && <ApiMotherTab data={data!} />}
          </DialogContent>
        </>
      )}
    </Dialog>
  );
}

function OfflineContent() {
  return (
    <DialogContent>
      <Stack spacing={2} alignItems="center" sx={{ py: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: 'error.main' }}>
          API Indisponivel
        </Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center">
          Nao foi possivel conectar ao servidor.
          Verifique se a API esta rodando e tente novamente.
        </Typography>
      </Stack>
    </DialogContent>
  );
}

function ApiMicroTab({ data }: { data: DeepHealthData }) {
  const { api, memory } = data;
  const heapPct = Math.round((memory.heapUsed / memory.heapTotal) * 100);

  return (
    <Stack spacing={2.5}>
      <Header
        ok={data.status === 'ok'}
        name={api.name}
        version={api.version}
      />

      <Section title="Servidor">
        <Row label="Ambiente" value={api.environment} />
        <Row label="Porta" value={String(api.port)} />
        <Row label="Uptime" value={fmtUptime(data.uptime)} />
        <Row label="PID" value={String(data.pid)} />
        <Row label="Node.js" value={data.nodeVersion} />
        <Row label="Plataforma" value={data.platform} />
        <Row label="Timestamp" value={fmtDate(data.timestamp)} />
      </Section>

      <Section title="Build">
        <Row label="Branch" value={api.branch} />
        <Row label="Commit" value={api.commitHash} mono />
        <Row label="Data do Build" value={fmtDate(api.buildDate)} />
      </Section>

      <Section title="Memoria">
        <Row label="RSS" value={`${memory.rss} MB`} />
        <Row label="Heap" value={`${memory.heapUsed} / ${memory.heapTotal} MB`} />
        <ProgressBar value={heapPct} />
      </Section>

      <Section title="Database">
        <Row label="Ambiente ativo" value={data.database} />
      </Section>
    </Stack>
  );
}

function ApiMotherTab({ data }: { data: DeepHealthData }) {
  const { apiMother } = data;
  const status = MOTHER_MAP[apiMother.status] ?? MOTHER_MAP.unknown;
  const v = apiMother.version as Record<string, unknown>;
  const h = apiMother.health as Record<string, unknown>;

  const sys = nested(h, 'info.system') || nested(h, 'details.system');
  const mem = nested(sys, 'memory') as Record<string, number> | null;
  const cpu = nested(sys, 'cpu') as Record<string, number> | null;
  const pool = nested(h, 'info.pool_utilization.utilization')
    || nested(h, 'details.pool_utilization.utilization');
  const sla = nested(h, 'info.latency_sla') || nested(h, 'details.latency_sla');
  const healthUptime = num(h, 'uptime');
  const startedAt = str(h, 'startedAt');

  return (
    <Stack spacing={2.5}>
      <Header
        ok={status?.severity === 'success'}
        warn={status?.severity === 'warning'}
        name={str(v, 'name') || 'API Mother (DBExplorer)'}
        version={str(v, 'version')}
        statusLabel={status?.label ?? 'Desconhecido'}
      />

      <Section title="Conexao">
        <Row label="Status" value={status?.label ?? 'Desconhecido'} />
        <Row label="URL" value={apiMother.url} mono />
      </Section>

      {hasKeys(v) && (
        <Section title="Build">
          {str(v, 'description') && <Row label="Descricao" value={str(v, 'description')!} />}
          {str(v, 'branch') && <Row label="Branch" value={str(v, 'branch')!} />}
          {str(v, 'commitHash') && <Row label="Commit" value={str(v, 'commitHash')!} mono />}
          {str(v, 'buildDate') && <Row label="Data do Build" value={fmtDate(str(v, 'buildDate')!)} />}
          {str(v, 'nodeVersion') && <Row label="Node.js" value={str(v, 'nodeVersion')!} />}
          {str(v, 'environment') && <Row label="Ambiente" value={str(v, 'environment')!} />}
        </Section>
      )}

      {(healthUptime != null || startedAt) && (
        <Section title="Servidor">
          {healthUptime != null && <Row label="Uptime" value={fmtUptime(Math.floor(healthUptime))} />}
          {startedAt && <Row label="Iniciado em" value={fmtDate(startedAt)} />}
          {str(h, 'database') && <Row label="Database" value={str(h, 'database')!} />}
        </Section>
      )}

      {mem && (
        <Section title="Memoria">
          <Row label="RSS" value={`${Math.round((mem.rss || 0) / 1024 / 1024)} MB`} />
          <Row
            label="Heap"
            value={`${Math.round((mem.heapUsed || 0) / 1024 / 1024)} / ${Math.round((mem.heapTotal || 0) / 1024 / 1024)} MB`}
          />
          {(mem.heapTotal ?? 0) > 0 && (
            <ProgressBar value={Math.round(((mem.heapUsed || 0) / (mem.heapTotal ?? 1)) * 100)} />
          )}
        </Section>
      )}

      {cpu && (
        <Section title="CPU">
          <Row label="Load 1m" value={String(cpu.loadavg_1m?.toFixed(2) ?? '-')} />
          <Row label="Load 5m" value={String(cpu.loadavg_5m?.toFixed(2) ?? '-')} />
          <Row label="Load 15m" value={String(cpu.loadavg_15m?.toFixed(2) ?? '-')} />
        </Section>
      )}

      {!!pool && hasKeys(pool as Record<string, unknown>) && (
        <Section title="Pool de Conexoes">
          {Object.entries(pool as Record<string, unknown>).map(([env, val]) => (
            <Row key={env} label={env} value={String(val ?? '-')} />
          ))}
        </Section>
      )}

      {!!sla && hasKeys(sla as Record<string, unknown>) && (
        <Section title="Latencia (SLA)">
          <Row
            label="P95"
            value={`${String((sla as Record<string, unknown>).p95_latency_ms ?? '-')} ms`}
          />
          <Row
            label="Threshold"
            value={`${String((sla as Record<string, unknown>).threshold_ms ?? '-')} ms`}
          />
          <Row
            label="Conforme"
            value={(sla as Record<string, unknown>).sla_compliant ? 'Sim' : 'Nao'}
          />
        </Section>
      )}

      {!hasKeys(v) && !hasKeys(h) ? (
        <Box sx={{ py: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Sem dados disponiveis — API Mother pode estar offline.
          </Typography>
        </Box>
      ) : null}
    </Stack>
  );
}

// ─── Shared components ───

function Header({ ok, warn, name, version, statusLabel }: {
  ok: boolean;
  warn?: boolean;
  name: string;
  version?: string | null;
  statusLabel?: string;
}) {
  const color = ok ? 'success' : warn ? 'warning' : 'error';
  return (
    <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
      <Chip
        label={statusLabel ?? (ok ? 'Online' : 'Erro')}
        size="small"
        sx={{
          bgcolor: `${color}.light`,
          color: `${color}.dark`,
          fontWeight: 700,
          fontSize: '0.7rem',
        }}
      />
      <Typography variant="h6" sx={{ fontWeight: 700 }}>
        {name}
      </Typography>
      {version && <Chip label={`v${version}`} size="small" variant="outlined" />}
    </Stack>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box>
      <Typography variant="overline" sx={{ color: 'text.secondary', mb: 1, display: 'block' }}>
        {title}
      </Typography>
      <Stack spacing={0.75} sx={{ pl: 0.5 }}>
        {children}
      </Stack>
    </Box>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
      <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0 }}>
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          fontWeight: 600,
          textAlign: 'right',
          wordBreak: 'break-all',
          ...(mono && { fontFamily: 'monospace', fontSize: '0.8rem' }),
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

function ProgressBar({ value }: { value: number }) {
  return (
    <Box sx={{ mt: 0.5 }}>
      <LinearProgress
        variant="determinate"
        value={value}
        sx={{
          height: 6,
          borderRadius: 3,
          bgcolor: 'action.hover',
          '& .MuiLinearProgress-bar': {
            borderRadius: 3,
            bgcolor: value > 80 ? 'error.main' : 'success.main',
          },
        }}
      />
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ mt: 0.25, display: 'block', textAlign: 'right' }}
      >
        {value}% utilizado
      </Typography>
    </Box>
  );
}

// ─── Helpers ───

const MOTHER_MAP: Record<string, { label: string; severity: 'success' | 'warning' | 'error' }> = {
  connected: { label: 'Conectada', severity: 'success' },
  reachable: { label: 'Acessivel', severity: 'success' },
  disconnected: { label: 'Desconectada', severity: 'error' },
  unreachable: { label: 'Inacessivel', severity: 'error' },
  unknown: { label: 'Desconhecido', severity: 'warning' },
};

function nested(obj: unknown, path: string): unknown {
  if (!obj || typeof obj !== 'object') return null;
  return path.split('.').reduce<unknown>((cur, key) => {
    if (cur && typeof cur === 'object' && key in (cur as Record<string, unknown>)) {
      return (cur as Record<string, unknown>)[key];
    }
    return null;
  }, obj);
}

function str(obj: unknown, key: string): string | null {
  if (!obj || typeof obj !== 'object') return null;
  const val = (obj as Record<string, unknown>)[key];
  return typeof val === 'string' ? val : null;
}

function num(obj: unknown, key: string): number | null {
  if (!obj || typeof obj !== 'object') return null;
  const val = (obj as Record<string, unknown>)[key];
  return typeof val === 'number' ? val : null;
}

function hasKeys(obj: unknown): boolean {
  return !!obj && typeof obj === 'object' && Object.keys(obj).length > 0;
}

function fmtUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  return `${m}m ${s}s`;
}

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString('pt-BR');
  } catch {
    return iso;
  }
}
