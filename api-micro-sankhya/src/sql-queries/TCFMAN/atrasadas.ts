/**
 * Lista manutenções preventivas atrasadas
 * Veículos que passaram do intervalo definido no plano
 * TCFMANVEI = relacionamento plano↔veículo (TCFMAN não tem CODVEICULO)
 */
export const manutencoesAtrasadas = `
SELECT
  man.NUPLANO AS nuplano,
  man.DESCRICAO AS descricao,
  man.TEMPO AS intervaloDias,
  v.CODVEICULO AS codveiculo,
  v.PLACA AS placa,
  MAX(cab.DATAFIN) AS ultimaManutencao,
  DATEDIFF(DAY, MAX(cab.DATAFIN), GETDATE()) AS diasDesdeUltima,
  DATEDIFF(DAY, MAX(cab.DATAFIN), GETDATE()) - man.TEMPO AS diasAtraso
FROM TCFMAN man
JOIN TCFMANVEI mv ON mv.NUPLANO = man.NUPLANO
JOIN TGFVEI v ON mv.CODVEICULO = v.CODVEICULO
LEFT JOIN TCFOSCAB cab ON cab.NUPLANO = man.NUPLANO AND cab.CODVEICULO = v.CODVEICULO AND cab.STATUS = 'F'
WHERE man.TEMPO IS NOT NULL
  AND man.ATIVO = 'S'
GROUP BY man.NUPLANO, man.DESCRICAO, man.TEMPO, v.CODVEICULO, v.PLACA
HAVING MAX(cab.DATAFIN) IS NOT NULL
  AND DATEDIFF(DAY, MAX(cab.DATAFIN), GETDATE()) > man.TEMPO
ORDER BY diasAtraso DESC
`;
