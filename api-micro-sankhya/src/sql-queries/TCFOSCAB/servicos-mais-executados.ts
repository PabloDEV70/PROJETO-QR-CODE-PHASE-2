/**
 * Serviços mais executados em um veículo
 */
export const servicosMaisExecutados = `
SELECT TOP 10
  srv.CODPROD AS codprod,
  CAST(prod.DESCRPROD AS VARCHAR(200)) AS servico,
  COUNT(*) AS execucoes,
  COUNT(DISTINCT srv.NUOS) AS totalOs,
  MAX(cab.DATAFIN) AS ultimaExecucao
FROM TCFSERVOS srv
JOIN TCFOSCAB cab ON cab.NUOS = srv.NUOS
LEFT JOIN TGFPRO prod ON prod.CODPROD = srv.CODPROD
WHERE cab.CODVEICULO = @codveiculo
GROUP BY srv.CODPROD, prod.DESCRPROD
ORDER BY execucoes DESC
`;
