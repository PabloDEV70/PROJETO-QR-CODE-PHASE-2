/**
 * Alertas críticos - Bloqueios comerciais sem previsão
 * Query validada contra PROD em 06/02/2026
 */
export const alertas = `
SELECT
  'CRITICO' AS tipo,
  'Bloqueio comercial sem previsao' AS mensagem,
  v.CODVEICULO AS codveiculo,
  v.PLACA AS placa,
  m.NUOS AS nuos,
  m.STATUS AS status,
  m.MANUTENCAO AS manutencao,
  m.AD_STATUSGIG AS adStatusGig,
  CONVERT(VARCHAR(19), m.DTABERTURA, 120) AS dtAbertura,
  DATEDIFF(DAY, m.DTABERTURA, GETDATE()) AS diasAtraso
FROM TCFOSCAB m
INNER JOIN TGFVEI v ON v.CODVEICULO = m.CODVEICULO
WHERE m.DATAFIN IS NULL
  AND m.AD_BLOQUEIOS = 'S'
  AND m.PREVISAO IS NULL
ORDER BY diasAtraso DESC
`;
