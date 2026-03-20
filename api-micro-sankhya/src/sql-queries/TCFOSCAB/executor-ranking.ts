export const executorRanking = `
SELECT
  ato.CODEXEC as CODUSU,
  uexec.NOMEUSU as nomeExecutor,
  COUNT(DISTINCT os.NUOS) as totalOS,
  COUNT(DISTINCT srv.SEQUENCIA) as totalServicos,
  COUNT(DISTINCT CASE WHEN ato.DHFIN IS NOT NULL THEN srv.SEQUENCIA END) as servicosConcluidos,
  CAST(
    ROUND(
      (CAST(COUNT(DISTINCT CASE WHEN ato.DHFIN IS NOT NULL THEN srv.SEQUENCIA END) AS FLOAT) * 100.0)
      / NULLIF(CAST(COUNT(DISTINCT srv.SEQUENCIA) AS FLOAT), 0),
      2
    ) AS DECIMAL(5,2)
  ) as taxaConclusao,
  ISNULL(
    AVG(DATEDIFF(MINUTE, ato.DHINI, ato.DHFIN)),
    0
  ) as tempoMedioMin
FROM TCFSERVOSATO ato
INNER JOIN TCFSERVOS srv ON ato.NUOS = srv.NUOS AND ato.SEQUENCIA = srv.SEQUENCIA
INNER JOIN TCFOSCAB os ON srv.NUOS = os.NUOS
LEFT JOIN TSIUSU uexec ON ato.CODEXEC = uexec.CODUSU
WHERE 1=1
-- @WHERE
GROUP BY ato.CODEXEC, uexec.NOMEUSU
ORDER BY taxaConclusao DESC, totalServicos DESC
`;
