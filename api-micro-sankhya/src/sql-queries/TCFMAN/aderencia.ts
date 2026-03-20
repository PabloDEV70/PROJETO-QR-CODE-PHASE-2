/**
 * Análise de aderência aos planos de manutenção
 * Verifica situação de cada veículo em relação ao seu plano
 * TCFMANVEI = relacionamento plano↔veículo (TCFMAN não tem CODVEICULO)
 */
export const aderenciaPlanos = `
SELECT
  man.NUPLANO AS nuplano,
  man.DESCRICAO AS descricao,
  man.TIPO AS tipo,
  man.TEMPO AS intervaloDias,
  man.KMHORIMETRO AS intervaloKm,
  v.CODVEICULO AS codveiculo,
  v.PLACA AS placa,
  MAX(cab.DATAFIN) AS ultimaManutencao,
  DATEDIFF(DAY, MAX(cab.DATAFIN), GETDATE()) AS diasDesdeUltima,
  CASE
    WHEN MAX(cab.DATAFIN) IS NULL THEN 'SEM_HISTORICO'
    WHEN DATEDIFF(DAY, MAX(cab.DATAFIN), GETDATE()) > man.TEMPO THEN 'ATRASADA'
    WHEN DATEDIFF(DAY, MAX(cab.DATAFIN), GETDATE()) > (man.TEMPO * 0.9) THEN 'PROXIMA'
    ELSE 'EM_DIA'
  END AS situacao,
  CASE
    WHEN MAX(cab.DATAFIN) IS NULL THEN NULL
    WHEN DATEDIFF(DAY, MAX(cab.DATAFIN), GETDATE()) > man.TEMPO
    THEN DATEDIFF(DAY, MAX(cab.DATAFIN), GETDATE()) - man.TEMPO
    ELSE NULL
  END AS diasAtraso
FROM TCFMAN man
JOIN TCFMANVEI mv ON mv.NUPLANO = man.NUPLANO
JOIN TGFVEI v ON mv.CODVEICULO = v.CODVEICULO
LEFT JOIN TCFOSCAB cab ON cab.NUPLANO = man.NUPLANO AND cab.CODVEICULO = v.CODVEICULO AND cab.STATUS = 'F'
WHERE man.TEMPO IS NOT NULL
  AND man.ATIVO = 'S'
GROUP BY man.NUPLANO, man.DESCRICAO, man.TIPO, man.TEMPO, man.KMHORIMETRO, v.CODVEICULO, v.PLACA
`;
