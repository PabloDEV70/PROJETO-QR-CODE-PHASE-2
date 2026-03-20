/**
 * Ranking de produtividade dos técnicos
 * Baseado em execuções com data de conclusão
 */
export const produtividadeTecnicos = `
SELECT TOP @limit
  usu.CODUSU AS codusu,
  usu.NOMEUSU AS nomeUsuario,
  COUNT(DISTINCT ex.NUOS) AS totalOs,
  COUNT(*) AS totalServicos,
  AVG(
    CASE
      WHEN ex.DTINI IS NOT NULL AND ex.DTFIN IS NOT NULL AND ex.DTFIN > ex.DTINI
      THEN DATEDIFF(MINUTE, ex.DTINI, ex.DTFIN)
      ELSE NULL
    END
  ) AS mediaMinutosServico,
  SUM(
    CASE
      WHEN ex.DTINI IS NOT NULL AND ex.DTFIN IS NOT NULL AND ex.DTFIN > ex.DTINI
      THEN DATEDIFF(MINUTE, ex.DTINI, ex.DTFIN)
      ELSE 0
    END
  ) AS totalMinutos
FROM AD_TCFEXEC ex
JOIN TSIUSU usu ON ex.CODUSUEXEC = usu.CODUSU
WHERE ex.DTFIN IS NOT NULL
GROUP BY usu.CODUSU, usu.NOMEUSU
ORDER BY totalServicos DESC
`;
