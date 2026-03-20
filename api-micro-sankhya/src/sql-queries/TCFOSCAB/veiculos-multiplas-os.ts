/**
 * Veículos com múltiplas OS ativas
 * Indicador de problemas recorrentes
 * Query validada contra PROD em 06/02/2026
 */
export const veiculosMultiplasOs = `
SELECT
  v.CODVEICULO AS codveiculo,
  v.PLACA AS placa,
  COUNT(cab.NUOS) AS qtdOsAtivas
FROM TCFOSCAB cab
INNER JOIN TGFVEI v ON v.CODVEICULO = cab.CODVEICULO
WHERE cab.STATUS IN ('A', 'E')
  AND cab.DATAFIN IS NULL
GROUP BY v.CODVEICULO, v.PLACA
HAVING COUNT(cab.NUOS) > 1
ORDER BY qtdOsAtivas DESC
`;
