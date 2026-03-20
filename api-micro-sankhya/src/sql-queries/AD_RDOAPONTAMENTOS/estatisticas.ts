/** Stats: totalRdos + totalFuncionarios (lightweight) */
export const estatisticasBase = `
SELECT
  COUNT(DISTINCT rdo.CODRDO) as totalRdos,
  COUNT(DISTINCT rdo.CODPARC) as totalFuncionarios
FROM AD_RDOAPONTAMENTOS rdo
WHERE 1=1 -- @WHERE_RDO
`;

/** Stats: totalItens, totalMinutos, totalHoras, mediaItensPorRdo */
export const estatisticasItens = `
SELECT
  COUNT(*) as totalItens,
  SUM(CASE WHEN d.HRFIM > d.HRINI AND d.HRFIM <= 2400 THEN
    ((d.HRFIM / 100) * 60 + (d.HRFIM % 100)) -
    ((d.HRINI / 100) * 60 + (d.HRINI % 100))
  ELSE 0 END) as totalMinutos,
  SUM(CASE WHEN d.HRFIM > d.HRINI AND d.HRFIM <= 2400 THEN
    ((d.HRFIM / 100) * 60 + (d.HRFIM % 100)) -
    ((d.HRINI / 100) * 60 + (d.HRINI % 100))
  ELSE 0 END) / 60.0 as totalHoras,
  SUM(CASE WHEN d.NUOS IS NOT NULL THEN 1 ELSE 0 END) as itensComOs,
  SUM(CASE WHEN d.NUOS IS NULL THEN 1 ELSE 0 END) as itensSemOs
FROM AD_RDOAPONDETALHES d
INNER JOIN AD_RDOAPONTAMENTOS rdo ON rdo.CODRDO = d.CODRDO
WHERE 1=1 -- @WHERE_RDO
`;

/** Stats: percentualProdutivo */
export const estatisticasProdutividade = `
SELECT
  CASE WHEN SUM(CASE WHEN d.HRFIM > d.HRINI AND d.HRFIM <= 2400 THEN
    ((d.HRFIM / 100) * 60 + (d.HRFIM % 100)) -
    ((d.HRINI / 100) * 60 + (d.HRINI % 100))
  ELSE 0 END) > 0
  THEN
    SUM(CASE WHEN m.PRODUTIVO = 'S' AND d.HRFIM > d.HRINI AND d.HRFIM <= 2400 THEN
      ((d.HRFIM / 100) * 60 + (d.HRFIM % 100)) -
      ((d.HRINI / 100) * 60 + (d.HRINI % 100))
    ELSE 0 END) * 100.0
    /
    SUM(CASE WHEN d.HRFIM > d.HRINI AND d.HRFIM <= 2400 THEN
      ((d.HRFIM / 100) * 60 + (d.HRFIM % 100)) -
      ((d.HRINI / 100) * 60 + (d.HRINI % 100))
    ELSE 0 END)
  ELSE 0 END as percentualProdutivo
FROM AD_RDOAPONDETALHES d
INNER JOIN AD_RDOAPONTAMENTOS rdo ON rdo.CODRDO = d.CODRDO
LEFT JOIN AD_RDOMOTIVOS m ON d.RDOMOTIVOCOD = m.RDOMOTIVOCOD
WHERE 1=1 -- @WHERE_RDO
`;

/** Keep old export name for backward compat (unused, kept to avoid broken imports) */
export const estatisticas = estatisticasBase;
