// Re-export hub — keeps existing imports working.
// Actual implementations live in database-queries, database-schema, database-audit.
export {
  executeQuery,
  getQueriesAtivas,
  getQueriesPesadas,
  getEstatisticasQuery,
  getSessoes,
  getVisaoServidor,
  getEstatisticasEspera,
} from '@/api/database-queries';

export {
  getTables,
  getTableSchema,
  getTableKeys,
  getViews,
  getViewDetalhe,
  getProcedures,
  getProcedureDetalhe,
  getTriggers,
  getTriggerDetalhe,
  getRelacionamentos,
  getDbResumo,
  getTableRelations,
  getFunctions,
  getFunctionDetalhe,
} from '@/api/database-schema';

export {
  getAuditHistorico,
  getAuditEstatisticas,
} from '@/api/database-audit';
