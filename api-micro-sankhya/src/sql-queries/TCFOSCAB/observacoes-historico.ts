/**
 * Observações técnicas do histórico do veículo
 */
export const observacoesHistorico = `
SELECT * FROM (
  SELECT
    cab.NUOS AS nuos,
    srv.SEQUENCIA AS sequencia,
    CAST(prod.DESCRPROD AS VARCHAR(200)) AS servico,
    CAST(srv.OBSERVACAO AS VARCHAR(500)) AS obsServico,
    CAST(ex.OBS AS VARCHAR(500)) AS obsExecucao,
    CONVERT(VARCHAR(19), ex.DTFIN, 120) AS dataExecucao,
    ROW_NUMBER() OVER (ORDER BY ex.DTFIN DESC) AS RowNum
  FROM TCFOSCAB cab
  JOIN TCFSERVOS srv ON srv.NUOS = cab.NUOS
  LEFT JOIN AD_TCFEXEC ex ON ex.NUOS = srv.NUOS AND ex.SEQUENCIA = srv.SEQUENCIA
  LEFT JOIN TGFPRO prod ON prod.CODPROD = srv.CODPROD
  WHERE cab.CODVEICULO = @codveiculo
    AND (srv.OBSERVACAO IS NOT NULL OR ex.OBS IS NOT NULL)
) AS T
WHERE RowNum > @offset AND RowNum <= (@offset + @limit)
`;
