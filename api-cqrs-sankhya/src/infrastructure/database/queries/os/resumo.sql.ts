export const osResumoQuery = `
SELECT
  COUNT(*) as totalOs,
  SUM(CASE WHEN os.STATUS = 'A' THEN 1 ELSE 0 END) as abertas,
  SUM(CASE WHEN os.STATUS = 'E' THEN 1 ELSE 0 END) as emExecucao,
  SUM(CASE WHEN os.STATUS = 'F' THEN 1 ELSE 0 END) as fechadas,
  SUM(CASE WHEN os.STATUS = 'C' THEN 1 ELSE 0 END) as canceladas,
  COUNT(DISTINCT os.CODVEICULO) as veiculosAtendidos
FROM TCFOSCAB os
LEFT JOIN TGFVEI v ON os.CODVEICULO = v.CODVEICULO
WHERE 1=1
-- @WHERE
`;
