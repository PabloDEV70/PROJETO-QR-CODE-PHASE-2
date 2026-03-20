export const estatisticas = `
SELECT
  COUNT(*) as totalOs,
  SUM(CASE WHEN SITUACAO IN ('A', 'P') THEN 1 ELSE 0 END) as osAbertas,
  SUM(CASE WHEN SITUACAO = 'F' THEN 1 ELSE 0 END) as osFechadas,
  SUM(CASE WHEN SITUACAO = 'C' THEN 1 ELSE 0 END) as osCanceladas,
  AVG(CAST(TEMPOGASTOSLA AS FLOAT)) as mediaTempoSlaMinutos
FROM TCSOSE
WHERE TEMPOGASTOSLA IS NOT NULL OR 1=1`;
