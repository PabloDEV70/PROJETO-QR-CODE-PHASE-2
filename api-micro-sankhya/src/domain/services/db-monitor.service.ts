import { apiMotherClient } from '../../infra/api-mother/client';

function cleanParams(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined && value !== null) {
      result[key] = value;
    }
  }
  return result;
}

/**
 * Unwrap API Mother double-wrapped envelope.
 * Axios response.data = { data: { success, data: {actual}, metadata } }
 * This extracts the {actual} payload.
 */
function unwrap(responseData: unknown): unknown {
  let d = responseData;
  // First level: { data: ... }
  if (d && typeof d === 'object' && 'data' in d) {
    d = (d as Record<string, unknown>).data;
  }
  // Second level: { success, data: ..., metadata }
  if (d && typeof d === 'object' && 'data' in d) {
    d = (d as Record<string, unknown>).data;
  }
  return d;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapVisaoServidor(raw: any) {
  return {
    nome: raw?.nomeServidor ?? '',
    versao: raw?.versaoSql ?? '',
    edicao: raw?.versaoSql?.split('\n')[0]?.trim() ?? '',
    nivelCompatibilidade: 0,
    collation: '',
    memoriaTotal: 0,
    memoriaDisponivel: 0,
    cpuCount: 0,
    uptimeDias: 0,
    conexoesAtivas: Number(raw?.conexoesUsuario ?? raw?.sessoesUsuarioAtivas ?? 0),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapSessao(raw: any) {
  return {
    session_id: raw?.idSessao ?? 0,
    login_name: raw?.nomeLogin ?? '',
    host_name: raw?.nomeHost ?? '',
    program_name: raw?.nomePrograma ?? '',
    status: raw?.status ?? '',
    database_name: '',
    cpu_time: raw?.tempoCpu ?? 0,
    memory_usage: 0,
    reads: raw?.leiturasLogicas ?? 0,
    writes: 0,
    logical_reads: raw?.leiturasLogicas ?? 0,
    login_time: raw?.horaLogin ?? '',
    last_request_start_time: '',
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapQueryAtiva(raw: any) {
  return {
    session_id: raw?.idSessao ?? 0,
    status: raw?.status ?? '',
    start_time: '',
    cpu_time: raw?.tempoCpu ?? 0,
    total_elapsed_time: raw?.tempoTotalDecorrido ?? 0,
    reads: 0,
    writes: 0,
    logical_reads: 0,
    text: raw?.textoQuery ?? '',
    database_name: raw?.nomeBancoDados ?? '',
    login_name: '',
    host_name: '',
    program_name: '',
    wait_type: raw?.tipoEspera ?? null,
    wait_time: 0,
    blocking_session_id: raw?.idSessaoBloqueadora ?? null,
    percent_complete: 0,
  };
}

export class DbMonitorService {
  async getQueriesAtivas(): Promise<unknown[]> {
    const response = await apiMotherClient.get('/monitoring/queries-ativas');
    const data = unwrap(response.data);
    const arr = Array.isArray(data) ? data : [];
    return arr.map(mapQueryAtiva);
  }

  async getQueriesPesadas(
    limite?: number,
    cpuMinimo?: number,
  ): Promise<unknown[]> {
    const params = cleanParams({ limite, cpuMinimo });
    const response = await apiMotherClient.get('/monitoring/queries-pesadas', { params });
    const data = unwrap(response.data);
    return Array.isArray(data) ? data : [];
  }

  async getEstatisticasQuery(limite?: number): Promise<unknown[]> {
    const params = cleanParams({ limite });
    const response = await apiMotherClient.get('/monitoring/estatisticas-query', { params });
    const data = unwrap(response.data);
    return Array.isArray(data) ? data : [];
  }

  async getSessoes(): Promise<unknown[]> {
    const response = await apiMotherClient.get('/monitoring/sessoes');
    const data = unwrap(response.data);
    const arr = Array.isArray(data) ? data : [];
    return arr.map(mapSessao);
  }

  async getVisaoServidor(): Promise<unknown> {
    const response = await apiMotherClient.get('/monitoring/visao-servidor');
    const data = unwrap(response.data);
    return mapVisaoServidor(data);
  }

  async getEstatisticasEspera(limite?: number): Promise<unknown[]> {
    const params = cleanParams({ limite });
    const response = await apiMotherClient.get('/monitoring/estatisticas-espera', { params });
    const data = unwrap(response.data);
    return Array.isArray(data) ? data : [];
  }

  async getPermissoes(): Promise<unknown> {
    const response = await apiMotherClient.get('/monitoring/permissoes');
    return unwrap(response.data);
  }
}
