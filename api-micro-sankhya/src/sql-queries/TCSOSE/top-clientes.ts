export const topClientes = `
SELECT TOP 10
  os.CODPARC,
  parc.NOMEPARC as nomeParc,
  COUNT(*) as totalOs,
  SUM(CASE WHEN os.SITUACAO = 'F' THEN 1 ELSE 0 END) as osFechadas,
  SUM(CASE WHEN os.SITUACAO IN ('A', 'P') THEN 1 ELSE 0 END) as osAbertas
FROM TCSOSE os
LEFT JOIN TGFPAR parc ON os.CODPARC = parc.CODPARC
GROUP BY os.CODPARC, parc.NOMEPARC
ORDER BY totalOs DESC
`;
