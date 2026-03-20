const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;

export const CACHE_TIMES = {
  /** Auth/me - always fresh */
  auth: { staleTime: 0, gcTime: 5 * MINUTE },
  /** RDO list - changes frequently, auto-refresh 30s */
  rdoList: { staleTime: 2 * MINUTE, gcTime: 10 * MINUTE, refetchInterval: 30 * SECOND },
  /** RDO detail - auto-refresh 30s (cross-device sync) */
  rdoDetail: { staleTime: 5 * MINUTE, gcTime: 30 * MINUTE, refetchInterval: 30 * SECOND },
  /** Stats/resumo - auto-refresh 60s */
  stats: { staleTime: 10 * MINUTE, gcTime: 30 * MINUTE, refetchInterval: 60 * SECOND },
  /** Motivos ativos - rarely changes, auto-refresh 5min */
  motivos: { staleTime: 30 * MINUTE, gcTime: HOUR, refetchInterval: 5 * MINUTE },
  /** Static filters (departamentos, cargos) - rarely changes */
  filters: { staleTime: 30 * MINUTE, gcTime: HOUR },
  /** Analytics/wrench-time - auto-refresh 60s */
  analytics: { staleTime: 5 * MINUTE, gcTime: 30 * MINUTE, refetchInterval: 60 * SECOND },
} as const;
