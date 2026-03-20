/**
 * Média de dias em manutenção por tipo
 * Permite identificar gargalos por categoria
 * Query validada contra PROD em 06/02/2026
 */
export const mediaDiasPorTipo = `
SELECT
  MANUTENCAO AS manutencao,
  CASE MANUTENCAO
    WHEN 'C' THEN 'Corretiva'
    WHEN 'P' THEN 'Preventiva'
    WHEN '5' THEN 'Borracharia'
    WHEN '1' THEN 'Revisao em Garantia'
    WHEN '2' THEN 'Corretiva Programada'
    WHEN 'R' THEN 'Reforma'
    WHEN 'S' THEN 'Socorro'
    WHEN 'O' THEN 'Outros'
    ELSE MANUTENCAO
  END AS tipo,
  COUNT(*) AS total,
  AVG(CAST(DATEDIFF(DAY, DATAINI, GETDATE()) AS FLOAT)) AS mediaDias
FROM TCFOSCAB
WHERE STATUS IN ('A', 'E') AND DATAFIN IS NULL
GROUP BY MANUTENCAO
ORDER BY mediaDias DESC
`;
