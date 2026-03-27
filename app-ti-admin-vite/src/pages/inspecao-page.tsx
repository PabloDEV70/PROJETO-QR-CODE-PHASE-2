import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Grid,
  Chip,
  Alert,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
  CircularProgress,
  Tooltip,
  Stack,
  Divider,
} from '@mui/material';
import {
  Refresh,
  Circle,
  Search,
  MonitorHeart,
  People,
  Storage,
  QueryStats,
  History,
  Speed,
  Http,
  Login,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import {
  fetchUsersOnline,
  fetchUsersOnlineCount,
  fetchHealthDeep,
  fetchDbSessions,
  fetchActiveQueries,
  fetchHeavyQueries,
  fetchServerStats,
  fetchWaitStats,
  fetchAuditHistory,
  fetchAuditStats,
  fetchRequestFeed,
  fetchLoginAttempts,
  type RequestFeedEntry,
  type LoginAttempt,
  type OnlineUser,
} from '@/api/monitoring';

// === URL State tab names ===
const TAB_KEYS = ['overview', 'requests', 'logins', 'online', 'queries', 'sessions', 'audit', 'server'] as const;

function useTabState() {
  const [params, setParams] = useSearchParams();
  const tabKey = params.get('tab') || 'overview';
  const tabIndex = Math.max(0, TAB_KEYS.indexOf(tabKey as typeof TAB_KEYS[number]));
  const setTab = (index: number) => {
    setParams({ tab: TAB_KEYS[index] }, { replace: true });
  };
  return { tabIndex, setTab };
}

// === Helpers ===
function formatUptime(s: number) {
  const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60);
  return d > 0 ? `${d}d ${h}h ${m}m` : h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function timeAgo(dateStr: string) {
  const sec = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (sec < 60) return `${sec}s atras`;
  const min = Math.floor(sec / 60);
  return min < 60 ? `${min}min atras` : `${Math.floor(min / 60)}h atras`;
}

function fmtTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function StatusDot({ ok }: { ok: boolean }) {
  return <Circle sx={{ fontSize: 10, color: ok ? 'success.main' : 'error.main', mr: 1 }} />;
}

function Loading() {
  return <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress size={32} /></Box>;
}

function Err({ msg }: { msg: string }) {
  return <Alert severity="error" sx={{ my: 2 }}>{msg}</Alert>;
}

function methodColor(m: string): 'success' | 'info' | 'warning' | 'error' | 'default' {
  if (m === 'GET') return 'success';
  if (m === 'POST') return 'info';
  if (m === 'PUT' || m === 'PATCH') return 'warning';
  if (m === 'DELETE') return 'error';
  return 'default';
}

function statusColor(c: number): 'success' | 'warning' | 'error' {
  return c < 400 ? 'success' : c < 500 ? 'warning' : 'error';
}

function SectionHeader({ title, count, onRefresh }: { title: string; count?: number; onRefresh?: () => void }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
      <Stack direction="row" spacing={1} alignItems="center">
        <Typography variant="h6">{title}</Typography>
        {count != null && <Chip label={count} size="small" variant="outlined" />}
      </Stack>
      {onRefresh && (
        <Button variant="outlined" size="small" startIcon={<Refresh />} onClick={onRefresh}>Atualizar</Button>
      )}
    </Box>
  );
}

function DbChip({ db }: { db: string }) {
  return (
    <Chip
      label={db}
      size="small"
      color={db === 'PROD' ? 'error' : db === 'TESTE' ? 'warning' : 'default'}
      variant="outlined"
    />
  );
}

function Mono({ children, sx }: { children: React.ReactNode; sx?: object }) {
  return <Typography variant="body2" fontFamily="monospace" fontSize={11} sx={sx}>{children}</Typography>;
}

// === Tab 0: Visao Geral ===
function OverviewTab() {
  const health = useQuery({ queryKey: ['health-deep'], queryFn: fetchHealthDeep, refetchInterval: 30_000 });
  const counts = useQuery({ queryKey: ['users-online-count'], queryFn: fetchUsersOnlineCount, refetchInterval: 15_000 });
  const feed = useQuery({ queryKey: ['request-feed-mini'], queryFn: () => fetchRequestFeed(10), refetchInterval: 5_000 });

  if (health.isLoading) return <Loading />;
  if (health.error) return <Err msg="Erro ao carregar health" />;

  const h = health.data!;
  const c = counts.data;
  const recentRequests = feed.data ?? [];

  return (
    <Grid container spacing={2}>
      {/* API Status Cards */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Paper sx={{ p: 2.5 }}>
          <Typography variant="overline" color="text.secondary">API Micro Sankhya</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, mb: 2 }}>
            <StatusDot ok={h.status === 'ok'} />
            <Typography variant="h6">{h.status === 'ok' ? 'Operacional' : 'Com problemas'}</Typography>
          </Box>
          <Stack direction="row" flexWrap="wrap" gap={1}>
            <Chip label={`v${h.api.version}`} size="small" variant="outlined" />
            <Chip label={h.api.environment} size="small" variant="outlined" />
            <Chip label={`Up ${formatUptime(h.uptime)}`} size="small" variant="outlined" />
            <Chip label={h.nodeVersion} size="small" variant="outlined" />
            <Chip label={`PID ${h.pid}`} size="small" variant="outlined" />
          </Stack>
        </Paper>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Paper sx={{ p: 2.5 }}>
          <Typography variant="overline" color="text.secondary">API Mother (NestJS)</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, mb: 2 }}>
            <StatusDot ok={h.apiMother.status === 'reachable'} />
            <Typography variant="h6">{h.apiMother.status === 'reachable' ? 'Operacional' : h.apiMother.status}</Typography>
          </Box>
          <Stack direction="row" flexWrap="wrap" gap={1}>
            {h.apiMother.version && typeof h.apiMother.version === 'object' && 'version' in h.apiMother.version && (
              <Chip label={`v${h.apiMother.version.version}`} size="small" variant="outlined" />
            )}
            <Chip label={h.apiMother.url} size="small" variant="outlined" />
          </Stack>
        </Paper>
      </Grid>

      {/* Metrics Row */}
      <Grid size={{ xs: 12, sm: 4 }}>
        <Paper sx={{ p: 2.5 }}>
          <Typography variant="overline" color="text.secondary">Usuarios Online</Typography>
          {c ? (
            <Box sx={{ mt: 1 }}>
              <Typography variant="h3" fontWeight={700}>{c.total}</Typography>
              <Stack direction="row" gap={1} mt={1}>
                <Chip label={`PROD ${c.counts.PROD}`} size="small" color="error" variant="outlined" />
                <Chip label={`TESTE ${c.counts.TESTE}`} size="small" color="warning" variant="outlined" />
                <Chip label={`TREINA ${c.counts.TREINA}`} size="small" variant="outlined" />
              </Stack>
            </Box>
          ) : <Typography color="text.secondary" sx={{ mt: 1 }}>Carregando...</Typography>}
        </Paper>
      </Grid>

      <Grid size={{ xs: 12, sm: 4 }}>
        <Paper sx={{ p: 2.5 }}>
          <Typography variant="overline" color="text.secondary">Memoria (Micro Sankhya)</Typography>
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2">RSS: <strong>{h.memory.rss} MB</strong></Typography>
            <Typography variant="body2">Heap: <strong>{h.memory.heapUsed}/{h.memory.heapTotal} MB</strong></Typography>
          </Box>
        </Paper>
      </Grid>

      <Grid size={{ xs: 12, sm: 4 }}>
        <Paper sx={{ p: 2.5 }}>
          <Typography variant="overline" color="text.secondary">Build</Typography>
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2">Branch: <strong>{h.api.branch}</strong></Typography>
            <Typography variant="body2">Commit: <strong>{h.api.commitHash?.slice(0, 8)}</strong></Typography>
            <Typography variant="body2">DB: <strong>{h.database}</strong></Typography>
          </Box>
        </Paper>
      </Grid>

      {/* Recent Requests Mini */}
      <Grid size={12}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="overline" color="text.secondary">Ultimos Requests</Typography>
          <TableContainer sx={{ mt: 1 }}>
            <Table size="small">
              <TableBody>
                {recentRequests.slice(0, 8).map((r: RequestFeedEntry, i: number) => (
                  <TableRow key={i}>
                    <TableCell sx={{ py: 0.5 }}><Mono>{fmtTime(r.ts)}</Mono></TableCell>
                    <TableCell sx={{ py: 0.5 }}><Chip label={r.method} size="small" color={methodColor(r.method)} variant="outlined" /></TableCell>
                    <TableCell sx={{ py: 0.5 }}><Mono sx={{ maxWidth: 350 }}>{r.path}</Mono></TableCell>
                    <TableCell sx={{ py: 0.5 }}><Chip label={r.status} size="small" color={statusColor(r.status)} variant="outlined" /></TableCell>
                    <TableCell sx={{ py: 0.5 }}><Mono>{r.durationMs}ms</Mono></TableCell>
                    <TableCell sx={{ py: 0.5 }}><Typography variant="body2" fontWeight={500}>{r.username}</Typography></TableCell>
                    <TableCell sx={{ py: 0.5 }}><DbChip db={r.database} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Grid>
    </Grid>
  );
}

// === Tab 1: Request Feed ===
function RequestFeedTab() {
  const [filter, setFilter] = useState('');
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['request-feed'],
    queryFn: () => fetchRequestFeed(500),
    refetchInterval: 3_000,
  });

  const requests = useMemo(() => {
    const all = data ?? [];
    if (!filter) return all;
    const lower = filter.toLowerCase();
    return all.filter((r: RequestFeedEntry) =>
      r.path.toLowerCase().includes(lower) ||
      r.username.toLowerCase().includes(lower) ||
      r.ip.includes(lower) ||
      r.method.toLowerCase().includes(lower) ||
      String(r.status).includes(lower),
    );
  }, [data, filter]);

  if (isLoading) return <Loading />;
  if (error) return <Err msg="Erro ao carregar request feed" />;

  const errors = requests.filter((r: RequestFeedEntry) => r.status >= 400).length;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, gap: 2, flexWrap: 'wrap' }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="h6">{requests.length} requests</Typography>
          {errors > 0 && <Chip label={`${errors} erros`} size="small" color="error" variant="outlined" />}
        </Stack>
        <Stack direction="row" spacing={1}>
          <TextField
            size="small"
            placeholder="Filtrar path, user, IP, status..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }}
            sx={{ minWidth: 280 }}
          />
          <Button variant="outlined" size="small" startIcon={<Refresh />} onClick={() => refetch()}>Atualizar</Button>
        </Stack>
      </Box>

      <TableContainer component={Paper} sx={{ maxHeight: 'calc(100vh - 280px)' }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Hora</TableCell>
              <TableCell>Metodo</TableCell>
              <TableCell>Path</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>ms</TableCell>
              <TableCell>Usuario</TableCell>
              <TableCell>App</TableCell>
              <TableCell>DB</TableCell>
              <TableCell>IP</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.map((r: RequestFeedEntry, i: number) => (
              <TableRow key={i} sx={{
                bgcolor: r.status >= 500 ? 'error.main' : r.status >= 400 ? 'warning.light' : undefined,
                '& td': r.status >= 500 ? { color: 'error.contrastText' } : {},
              }}>
                <TableCell><Mono>{fmtTime(r.ts)}</Mono></TableCell>
                <TableCell><Chip label={r.method} size="small" color={methodColor(r.method)} variant="outlined" /></TableCell>
                <TableCell>
                  <Tooltip title={r.path}><Mono sx={{ maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{r.path}</Mono></Tooltip>
                </TableCell>
                <TableCell><Chip label={r.status} size="small" color={statusColor(r.status)} variant="outlined" /></TableCell>
                <TableCell>
                  <Mono sx={{ color: r.durationMs > 3000 ? 'error.main' : r.durationMs > 1000 ? 'warning.main' : 'text.secondary' }}>
                    {r.durationMs}
                  </Mono>
                </TableCell>
                <TableCell><Typography variant="body2" fontWeight={r.username !== 'anonymous' ? 500 : 400}>{r.username}</Typography></TableCell>
                <TableCell><Chip label={r.app || '-'} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} /></TableCell>
                <TableCell><DbChip db={r.database} /></TableCell>
                <TableCell><Mono>{r.ip}</Mono></TableCell>
              </TableRow>
            ))}
            {requests.length === 0 && (
              <TableRow><TableCell colSpan={9} align="center"><Typography color="text.secondary" sx={{ py: 3 }}>Nenhum request</Typography></TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

// === Tab 2: Login Attempts ===
function LoginAttemptsTab() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['login-attempts'],
    queryFn: () => fetchLoginAttempts(300),
    refetchInterval: 10_000,
  });

  if (isLoading) return <Loading />;
  if (error) return <Err msg="Erro ao carregar tentativas de login" />;

  const attempts = data ?? [];
  const successes = attempts.filter((a: LoginAttempt) => a.success).length;
  const failures = attempts.length - successes;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="h6">{attempts.length} tentativas</Typography>
          <Chip label={`${successes} OK`} size="small" color="success" variant="outlined" />
          {failures > 0 && <Chip label={`${failures} falha`} size="small" color="error" />}
        </Stack>
        <Button variant="outlined" size="small" startIcon={<Refresh />} onClick={() => refetch()}>Atualizar</Button>
      </Box>

      <TableContainer component={Paper} sx={{ maxHeight: 'calc(100vh - 280px)' }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Hora</TableCell>
              <TableCell>Usuario</TableCell>
              <TableCell>Resultado</TableCell>
              <TableCell>IP</TableCell>
              <TableCell>Origem</TableCell>
              <TableCell>User Agent</TableCell>
              <TableCell>Erro</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {attempts.map((a: LoginAttempt, i: number) => (
              <TableRow key={i} sx={{
                bgcolor: !a.success ? 'error.main' : undefined,
                '& td': !a.success ? { color: 'error.contrastText' } : {},
              }}>
                <TableCell><Mono>{fmtTime(a.ts)}</Mono></TableCell>
                <TableCell><Typography variant="body2" fontWeight={600}>{a.username}</Typography></TableCell>
                <TableCell><Chip label={a.success ? 'OK' : 'FALHA'} size="small" color={a.success ? 'success' : 'error'} variant={a.success ? 'outlined' : 'filled'} /></TableCell>
                <TableCell><Mono>{a.ip}</Mono></TableCell>
                <TableCell><Typography variant="caption" noWrap sx={{ maxWidth: 150, display: 'block' }}>{a.origin}</Typography></TableCell>
                <TableCell><Tooltip title={a.userAgent}><Typography variant="caption" noWrap sx={{ maxWidth: 200, display: 'block' }}>{a.userAgent}</Typography></Tooltip></TableCell>
                <TableCell>{a.error && <Tooltip title={a.error}><Typography variant="caption" noWrap sx={{ maxWidth: 200, display: 'block' }}>{a.error}</Typography></Tooltip>}</TableCell>
              </TableRow>
            ))}
            {attempts.length === 0 && (
              <TableRow><TableCell colSpan={7} align="center"><Typography color="text.secondary" sx={{ py: 3 }}>Nenhuma tentativa registrada</Typography></TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

// === Tab 3: Usuarios Online ===
function UsersOnlineTab() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['users-online'],
    queryFn: () => fetchUsersOnline(),
    refetchInterval: 8_000,
  });
  const counts = useQuery({ queryKey: ['users-online-count'], queryFn: fetchUsersOnlineCount, refetchInterval: 10_000 });

  if (isLoading) return <Loading />;
  if (error) return <Err msg="Erro ao carregar usuarios online" />;

  const users = data ?? [];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="h6">{users.length} usuario(s) online</Typography>
          {counts.data && (
            <>
              <Chip label={`PROD ${counts.data.counts.PROD}`} size="small" color="error" variant="outlined" />
              <Chip label={`TESTE ${counts.data.counts.TESTE}`} size="small" color="warning" variant="outlined" />
              <Chip label={`TREINA ${counts.data.counts.TREINA}`} size="small" variant="outlined" />
            </>
          )}
        </Stack>
        <Button variant="outlined" size="small" startIcon={<Refresh />} onClick={() => refetch()}>Atualizar</Button>
      </Box>

      {users.length === 0 ? (
        <Alert severity="info">Nenhum usuario online</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Usuario</TableCell>
                <TableCell>App</TableCell>
                <TableCell>Database</TableCell>
                <TableCell>IP</TableCell>
                <TableCell>Ultimo Request</TableCell>
                <TableCell>Metodo</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Visto</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((u: OnlineUser, i: number) => (
                <TableRow key={i}>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>{u.username}</Typography>
                    <Typography variant="caption" color="text.secondary">ID: {u.userId}</Typography>
                  </TableCell>
                  <TableCell><Chip label={u.app || '-'} size="small" color="primary" variant="outlined" sx={{ fontSize: '0.7rem' }} /></TableCell>
                  <TableCell><DbChip db={u.database} /></TableCell>
                  <TableCell><Mono>{u.ip}</Mono></TableCell>
                  <TableCell><Tooltip title={u.lastPath}><Mono sx={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{u.lastPath}</Mono></Tooltip></TableCell>
                  <TableCell><Chip label={u.lastMethod} size="small" color={methodColor(u.lastMethod)} variant="outlined" /></TableCell>
                  <TableCell><Chip label={u.statusCode} size="small" color={statusColor(u.statusCode)} variant="outlined" /></TableCell>
                  <TableCell><Typography variant="caption">{timeAgo(u.lastSeen)}</Typography></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}

// === Tab 4: Queries ===
function QueriesTab() {
  const active = useQuery({ queryKey: ['queries-ativas'], queryFn: fetchActiveQueries, refetchInterval: 30_000, retry: 1 });
  const heavy = useQuery({ queryKey: ['queries-pesadas'], queryFn: () => fetchHeavyQueries(30), refetchInterval: 60_000, retry: 1 });

  return (
    <Box>
      <SectionHeader title="Queries em Execucao" count={Array.isArray(active.data) ? active.data.length : undefined} onRefresh={() => active.refetch()} />
      {active.isLoading ? <Loading /> : active.error ? <Err msg="Erro" /> : <DynTable data={active.data ?? []} maxW={400} />}

      <Divider sx={{ my: 3 }} />

      <SectionHeader title="Queries Mais Pesadas (CPU)" onRefresh={() => heavy.refetch()} />
      {heavy.isLoading ? <Loading /> : heavy.error ? <Err msg="Erro" /> : <DynTable data={(heavy.data ?? []).slice(0, 30)} maxW={300} />}
    </Box>
  );
}

// === Tab 5: Sessoes DB ===
function SessionsTab() {
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['db-sessoes'], queryFn: fetchDbSessions, refetchInterval: 30_000, retry: 1 });

  if (isLoading) return <Loading />;
  if (error) return <Err msg="Erro ao carregar sessoes" />;
  const sessions = data ?? [];

  return (
    <Box>
      <SectionHeader title="Sessoes Ativas SQL Server" count={sessions.length} onRefresh={() => refetch()} />
      <DynTable data={sessions} maxW={250} />
    </Box>
  );
}

// === Tab 6: Audit ===
function AuditTab() {
  const [tabela, setTabela] = useState('');
  const [usuario, setUsuario] = useState('');
  const [operacao, setOperacao] = useState('');

  const history = useQuery({
    queryKey: ['audit-historico', tabela, usuario, operacao],
    queryFn: () => fetchAuditHistory({ tabela: tabela || undefined, usuario: usuario || undefined, operacao: operacao || undefined, limit: 50 }),
    refetchInterval: 30_000,
  });
  const stats = useQuery({ queryKey: ['audit-stats'], queryFn: () => fetchAuditStats(), refetchInterval: 60_000 });

  return (
    <Box>
      {stats.data && typeof stats.data === 'object' && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="overline" color="text.secondary">Estatisticas</Typography>
          <pre style={{ fontSize: 12, margin: '8px 0 0', overflow: 'auto', maxHeight: 180 }}>{JSON.stringify(stats.data, null, 2)}</pre>
        </Paper>
      )}

      <SectionHeader title="Historico de Auditoria" />
      <Stack direction="row" gap={2} mb={2} flexWrap="wrap">
        <TextField size="small" placeholder="Tabela..." value={tabela} onChange={(e) => setTabela(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }} />
        <TextField size="small" placeholder="Usuario..." value={usuario} onChange={(e) => setUsuario(e.target.value)} />
        <TextField size="small" placeholder="Operacao..." value={operacao} onChange={(e) => setOperacao(e.target.value)} />
      </Stack>

      {history.isLoading ? <Loading /> : history.error ? <Err msg="Erro" /> : <DynTable data={history.data as Record<string, unknown>[] ?? []} maxW={300} />}
    </Box>
  );
}

// === Tab 7: Servidor / Database ===
function ServerTab() {
  const server = useQuery({ queryKey: ['server-stats'], queryFn: fetchServerStats, refetchInterval: 60_000, retry: 1 });
  const waits = useQuery({ queryKey: ['wait-stats'], queryFn: () => fetchWaitStats(20), refetchInterval: 60_000, retry: 1 });

  const sv = server.data;
  const svObj = Array.isArray(sv) ? sv[0] : sv;

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>Visao do Servidor SQL</Typography>
      {server.isLoading ? <Loading /> : server.error ? <Err msg="Erro" /> : svObj && typeof svObj === 'object' ? (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {Object.entries(svObj as Record<string, unknown>).map(([key, val]) => (
            <Grid size={{ xs: 6, sm: 4, md: 3 }} key={key}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="caption" color="text.secondary">{key}</Typography>
                <Typography variant="body1" fontWeight={500} noWrap>{val != null ? String(val) : '-'}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      ) : null}

      <Divider sx={{ my: 3 }} />

      <SectionHeader title="Estatisticas de Espera (Wait Stats)" onRefresh={() => waits.refetch()} />
      {waits.isLoading ? <Loading /> : waits.error ? <Err msg="Erro" /> : <DynTable data={waits.data ?? []} maxW={250} />}
    </Box>
  );
}

// === Generic dynamic table ===
function DynTable({ data, maxW = 300 }: { data: unknown; maxW?: number }) {
  const rows = Array.isArray(data) ? data as Record<string, unknown>[] : [];
  if (rows.length === 0) {
    return <Paper sx={{ p: 3, textAlign: 'center' }}><Typography color="text.secondary">Sem dados</Typography></Paper>;
  }
  const keys = Object.keys(rows[0]);
  return (
    <TableContainer component={Paper} sx={{ maxHeight: 500 }}>
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            {keys.map((k) => <TableCell key={k}><Typography variant="caption" fontWeight={600}>{k}</Typography></TableCell>)}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, i) => (
            <TableRow key={i}>
              {keys.map((k) => (
                <TableCell key={k}>
                  <Tooltip title={String(row[k] ?? '')}>
                    <Mono sx={{ maxWidth: maxW, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                      {row[k] != null ? String(row[k]) : '-'}
                    </Mono>
                  </Tooltip>
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

// === Main ===
export default function InspecaoPage() {
  const { tabIndex, setTab } = useTabState();

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 0.5 }}>Central de Inspecao</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Monitoramento em tempo real — requests, logins, usuarios, queries, database
      </Typography>

      <Tabs
        value={tabIndex}
        onChange={(_, v) => setTab(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ borderBottom: 1, borderColor: 'divider', mb: 0.5 }}
      >
        <Tab icon={<MonitorHeart />} iconPosition="start" label="Visao Geral" />
        <Tab icon={<Http />} iconPosition="start" label="Requests" />
        <Tab icon={<Login />} iconPosition="start" label="Logins" />
        <Tab icon={<People />} iconPosition="start" label="Online" />
        <Tab icon={<QueryStats />} iconPosition="start" label="Queries" />
        <Tab icon={<Storage />} iconPosition="start" label="Sessoes" />
        <Tab icon={<History />} iconPosition="start" label="Auditoria" />
        <Tab icon={<Speed />} iconPosition="start" label="Servidor" />
      </Tabs>

      <Box sx={{ pt: 2 }}>
        {tabIndex === 0 && <OverviewTab />}
        {tabIndex === 1 && <RequestFeedTab />}
        {tabIndex === 2 && <LoginAttemptsTab />}
        {tabIndex === 3 && <UsersOnlineTab />}
        {tabIndex === 4 && <QueriesTab />}
        {tabIndex === 5 && <SessionsTab />}
        {tabIndex === 6 && <AuditTab />}
        {tabIndex === 7 && <ServerTab />}
      </Box>
    </Box>
  );
}
