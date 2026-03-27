import { apiClient } from './client';

export interface OnlineUser {
  userId: number;
  username: string;
  database: string;
  ip: string;
  app: string;
  lastPath: string;
  lastMethod: string;
  statusCode: number;
  lastSeen: string;
}

export interface OnlineCount {
  counts: { PROD: number; TESTE: number; TREINA: number };
  total: number;
  timestamp: string;
}

export interface HealthDeep {
  status: string;
  timestamp: string;
  uptime: number;
  nodeVersion: string;
  platform: string;
  pid: number;
  memory: { rss: number; heapUsed: number; heapTotal: number };
  database: string;
  api: {
    name: string;
    version: string;
    branch: string;
    commitHash: string;
    commitShort: string;
    buildDate: string;
    environment: string;
    port: number;
  };
  apiMother: {
    status: string;
    url: string;
    version: Record<string, unknown>;
    health: Record<string, unknown>;
  };
}

export interface DbSession {
  spid: number;
  login_name: string;
  db_name: string;
  status: string;
  program_name: string;
  host_name: string;
  [key: string]: unknown;
}

export interface ActiveQuery {
  session_id: number;
  login_name: string;
  db_name: string;
  status: string;
  command: string;
  sql_text: string;
  cpu_time: number;
  total_elapsed_time: number;
  [key: string]: unknown;
}

export interface ServerStats {
  [key: string]: unknown;
}

export interface AuditEntry {
  [key: string]: unknown;
}

export interface AuditStats {
  [key: string]: unknown;
}

export interface WaitStats {
  [key: string]: unknown;
}

export interface HeavyQuery {
  [key: string]: unknown;
}

export async function fetchUsersOnline(database?: string): Promise<OnlineUser[]> {
  const params = database ? `?database=${database}` : '';
  const { data } = await apiClient.get(`/monitoring/users-online${params}`);
  // API returns { online: [...], total } or directly an array
  return data?.online ?? (Array.isArray(data) ? data : []);
}

export async function fetchUsersOnlineCount(): Promise<OnlineCount> {
  const { data } = await apiClient.get('/monitoring/users-online/count');
  // Normalize - API may return { counts: {...}, total } or just { total }
  return {
    counts: data?.counts ?? { PROD: 0, TESTE: 0, TREINA: 0 },
    total: data?.total ?? 0,
    timestamp: data?.timestamp ?? new Date().toISOString(),
  };
}

export async function fetchHealthDeep() {
  const { data } = await apiClient.get<HealthDeep>('/health/deep');
  return data;
}

export async function fetchDbSessions() {
  const { data } = await apiClient.get<DbSession[]>('/db/monitor/sessoes');
  return data;
}

export async function fetchActiveQueries() {
  const { data } = await apiClient.get<ActiveQuery[]>('/db/monitor/queries-ativas');
  return data;
}

export async function fetchHeavyQueries(limite = 20) {
  const { data } = await apiClient.get<HeavyQuery[]>(`/db/monitor/queries-pesadas?limite=${limite}`);
  return data;
}

export async function fetchServerStats() {
  const { data } = await apiClient.get<ServerStats[]>('/db/monitor/visao-servidor');
  return data;
}

export async function fetchWaitStats(limite = 20) {
  const { data } = await apiClient.get<WaitStats[]>(`/db/monitor/estatisticas-espera?limite=${limite}`);
  return data;
}

export async function fetchAuditHistory(filters?: {
  tabela?: string;
  usuario?: string;
  operacao?: string;
  page?: number;
  limit?: number;
}) {
  const params = new URLSearchParams();
  if (filters?.tabela) params.set('tabela', filters.tabela);
  if (filters?.usuario) params.set('usuario', filters.usuario);
  if (filters?.operacao) params.set('operacao', filters.operacao);
  if (filters?.page) params.set('page', String(filters.page));
  if (filters?.limit) params.set('limit', String(filters.limit));
  const qs = params.toString();
  const { data } = await apiClient.get<AuditEntry[]>(`/db/audit/historico${qs ? `?${qs}` : ''}`);
  return data;
}

export async function fetchAuditStats(tabela?: string) {
  const params = tabela ? `?tabela=${tabela}` : '';
  const { data } = await apiClient.get<AuditStats>(`/db/audit/estatisticas${params}`);
  return data;
}

export async function fetchQueryStats(limite = 20) {
  const { data } = await apiClient.get<HeavyQuery[]>(`/db/monitor/estatisticas-query?limite=${limite}`);
  return data;
}

export async function fetchDbPermissions() {
  const { data } = await apiClient.get('/db/monitor/permissoes');
  return data;
}

export interface RequestFeedEntry {
  ts: string;
  method: string;
  path: string;
  status: number;
  durationMs: number;
  userId: string;
  username: string;
  database: string;
  ip: string;
  app: string;
  userAgent: string;
}

export interface LoginAttempt {
  ts: string;
  username: string;
  ip: string;
  userAgent: string;
  origin: string;
  success: boolean;
  error?: string;
}

export async function fetchRequestFeed(limit = 200) {
  const { data } = await apiClient.get<{ requests: RequestFeedEntry[] }>(`/monitoring/request-feed?limit=${limit}`);
  return data.requests ?? [];
}

export async function fetchLoginAttempts(limit = 200) {
  const { data } = await apiClient.get<{ attempts: LoginAttempt[] }>(`/monitoring/login-attempts?limit=${limit}`);
  return data.attempts ?? [];
}
