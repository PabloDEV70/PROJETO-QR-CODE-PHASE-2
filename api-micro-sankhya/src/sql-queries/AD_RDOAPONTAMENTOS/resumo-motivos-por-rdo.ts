/**
 * Retorna resumo de minutos por motivo para um conjunto de CODRDOs.
 * Usado para calcular produtividade por RDO no grid.
 */
export function resumoMotivosPorRdo(codrdos: number[]): string {
  const inClause = codrdos.join(',');
  return `
SELECT
  d.CODRDO as codrdo,
  d.RDOMOTIVOCOD as rdomotivocod,
  COUNT(*) as qtdRegistros,
  ISNULL(SUM(CASE WHEN d.HRFIM > d.HRINI AND d.HRFIM <= 2400 THEN
    ((d.HRFIM / 100) * 60 + (d.HRFIM % 100)) -
    ((d.HRINI / 100) * 60 + (d.HRINI % 100))
  ELSE 0 END), 0) as totalMinutos
FROM AD_RDOAPONDETALHES d
WHERE d.CODRDO IN (${inClause})
GROUP BY d.CODRDO, d.RDOMOTIVOCOD
`;
}
