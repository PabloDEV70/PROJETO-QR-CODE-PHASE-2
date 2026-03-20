/**
 * Histórico completo de execuções de uma OS
 * Inclui executor, tempo, observações
 */
export const historicoOs = `
SELECT
  cab.NUOS AS nuos,
  cab.CODVEICULO AS codveiculo,
  v.PLACA AS placa,
  cab.STATUS AS status,
  CONVERT(VARCHAR(19), cab.DTABERTURA, 120) AS dtAbertura,
  cab.DATAINI AS dataIni,
  CONVERT(VARCHAR(19), cab.DATAFIN, 120) AS dataFin,
  srv.SEQUENCIA AS sequencia,
  srv.CODPROD AS codprod,
  pro.DESCRPROD AS servico,
  ex.CODUSUEXEC AS codusuexec,
  usu.NOMEUSU AS nomeExecutor,
  CONVERT(VARCHAR(19), ex.DTINI, 120) AS dtini,
  CONVERT(VARCHAR(19), ex.DTFIN, 120) AS dtfin,
  CASE
    WHEN ex.DTINI IS NOT NULL AND ex.DTFIN IS NOT NULL AND ex.DTFIN > ex.DTINI
    THEN DATEDIFF(MINUTE, ex.DTINI, ex.DTFIN)
    ELSE NULL
  END AS minutosExecucao,
  ex.OBS AS obsExecucao,
  srv.OBSERVACAO AS obsServico
FROM TCFOSCAB cab
JOIN TCFSERVOS srv ON cab.NUOS = srv.NUOS
LEFT JOIN AD_TCFEXEC ex ON srv.NUOS = ex.NUOS AND srv.SEQUENCIA = ex.SEQUENCIA
LEFT JOIN TSIUSU usu ON ex.CODUSUEXEC = usu.CODUSU
LEFT JOIN TGFVEI v ON cab.CODVEICULO = v.CODVEICULO
LEFT JOIN TGFPRO pro ON srv.CODPROD = pro.CODPROD
WHERE cab.NUOS = @nuos
ORDER BY srv.SEQUENCIA, ex.DTINI
`;
