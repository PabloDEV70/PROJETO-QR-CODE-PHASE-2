/**
 * Table-level write operation permissions by environment
 *
 * Defines which tables are allowed for INSERT, UPDATE, DELETE, PATCH operations
 * in PROD, TESTE, and TREINA environments.
 *
 * NOTE: PATCH operations follow the same rules as UPDATE (partial update).
 * No separate configuration is needed - use WRITE_ALLOWED_* env vars as usual.
 *
 * Supports:
 * - Explicit table names (case-insensitive): 'AD_RDOAPONTAMENTOS'
 * - Wildcard patterns: 'AD_*', 'TSI*'
 * - Single wildcard: '*' (all tables)
 *
 * @see TablePermissionService for validation logic
 */

export interface TablePermissionConfig {
  /** Tables allowed for write operations (supports wildcards) */
  allowedTables: string[];

  /** Patterns of tables to block (overrides allowlist) */
  blockedPatterns: string[];

  /** Whether x-boss-approval header is required for writes */
  requireBossApproval: boolean;

  /** Description of this configuration */
  description?: string;
}

/**
 * Default table write permissions by environment
 *
 * PROD:
 *   - Only RDO module tables (AD_RDOAPONTAMENTOS, AD_RDOAPONDETALHES, AD_RDOMOTIVOS)
 *   - Requires x-boss-approval header
 *   - Blocks all system tables (TSI*, TDD*, TRD*, etc)
 *
 * TESTE:
 *   - All tables allowed
 *   - No approval required
 *
 * TREINA:
 *   - No tables allowed (hard block)
 *   - No approval will help
 */
export const TABLE_WRITE_PERMISSIONS: Record<string, TablePermissionConfig> = {
  PROD: {
    allowedTables: [
      // RDO Module (Apontamentos)
      'AD_RDOAPONTAMENTOS', // RDO Master
      'AD_RDOAPONDETALHES', // RDO Details
      'AD_RDOMOTIVOS', // RDO Motivos

      // Painel Veiculos (Status/Historico)
      'AD_HSTVEI', // Historico situacoes de veiculos
      'AD_ADHSTVEISIT', // Situacoes de veiculos (lookup)
      'AD_ADHSTVEIPRI', // Prioridades de veiculos (lookup)

      // OS Manutencao
      'TCFOSCAB', // Ordem de Servico - cabecalho
      'TCFOSITE', // Ordem de Servico - itens
      'TCFSERVOS', // Servicos da OS
      'TCSOSE', // OS servicos executados
      'TCSOSI', // OS servicos itens

      // Executores e Apontamentos
      'AD_TCFEXEC', // Executores OS
      'AD_APONTSOL', // Apontamento solicitacoes
    ],

    blockedPatterns: [
      // System tables - ALWAYS blocked
      'TSI*', // Usuarios, Empresas, Configurações
      'TDD*', // Dicionário de dados
      'TRD*', // UI/Screen metadata
      'AD_*', // Other AD tables (except those in allowlist)
    ],

    requireBossApproval: true,

    description:
      'Produção: Apenas tabelas RDO e custom aprovadas. Requer x-boss-approval header para operações de escrita.',
  },

  TESTE: {
    allowedTables: ['*'], // All tables allowed in test environment

    blockedPatterns: [], // No blocks in test

    requireBossApproval: false,

    description: 'Teste: Todas as tabelas são permitidas sem restrições.',
  },

  TREINA: {
    allowedTables: [
      'AD_TELAEXEMPLO01', // Test table for CRUD operations
    ],

    blockedPatterns: [], // Allow specified tables only

    requireBossApproval: false,

    description: 'Treina: Permite operações de escrita apenas em tabelas de teste (AD_TELAEXEMPLO01).',
  },
};
