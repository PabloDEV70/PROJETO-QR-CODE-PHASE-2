const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;

export const CACHE_TIMES = {
  /** Auth/me - always fresh */
  auth: { staleTime: 0, gcTime: 5 * MINUTE },
  /** RDO list - fresh 2min, refetch on focus (not polling) */
  rdoList: { staleTime: 2 * MINUTE, gcTime: 10 * MINUTE },
  /** RDO detail - fresh 2min, refetch on focus */
  rdoDetail: { staleTime: 2 * MINUTE, gcTime: 30 * MINUTE },
  /** Stats/resumo - fresh 5min */
  stats: { staleTime: 5 * MINUTE, gcTime: 30 * MINUTE },
  /** Motivos ativos - rarely changes */
  motivos: { staleTime: 30 * MINUTE, gcTime: HOUR },
} as const;
