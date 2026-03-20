export const dashboardStatus = `
SELECT
  STATUSOS,
  CASE STATUSOS
    WHEN 'MA' THEN 'Manutenção'
    WHEN 'AN' THEN 'Em Análise'
    WHEN 'AV' THEN 'Aprovado'
    WHEN 'SN' THEN 'Sem Necessidade'
    ELSE 'Sem Status'
  END AS descricao,
  COUNT(*) AS total,
  CAST(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM AD_APONTAMENTO WITH (NOLOCK)) AS DECIMAL(5,2)) AS percentual
FROM AD_APONTAMENTO WITH (NOLOCK)
GROUP BY STATUSOS
ORDER BY total DESC
`;
