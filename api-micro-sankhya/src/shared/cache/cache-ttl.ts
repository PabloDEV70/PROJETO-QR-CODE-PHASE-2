export const CACHE_TTL = {
  DICTIONARY: 10 * 60 * 1000,   // 10 min
  FILTERS: 5 * 60 * 1000,       // 5 min
  MOTIVOS: 5 * 60 * 1000,       // 5 min
  RESUMO: 2 * 60 * 1000,        // 2 min
  CHAMADOS: 1 * 60 * 1000,      // 1 min
  RDO_LIST: 60 * 1000,          // 1 min
  QUEM_FAZ: 5 * 1000,           // 5 sec — live dashboard
  RDO_DETALHES: 30 * 1000,      // 30 sec
  RDO_METRICAS: 60 * 1000,      // 1 min
  CARGA_HORARIA: 30 * 60 * 1000, // 30 min — rarely changes
} as const;
