/**
 * Resumo do histórico de manutenção de um veículo
 */
export const historicoResumo = `
SELECT
  v.CODVEICULO AS codveiculo,
  v.PLACA AS placa,
  CAST(v.MARCAMODELO AS VARCHAR(100)) AS marcaModelo,
  COUNT(DISTINCT cab.NUOS) AS totalOs,
  SUM(CASE WHEN cab.MANUTENCAO = 'C' THEN 1 ELSE 0 END) AS corretivas,
  SUM(CASE WHEN cab.MANUTENCAO = 'P' THEN 1 ELSE 0 END) AS preventivas,
  MIN(cab.DTABERTURA) AS primeiraOs,
  MAX(cab.DTABERTURA) AS ultimaOs,
  AVG(DATEDIFF(DAY, cab.DATAINI, cab.DATAFIN)) AS mediaDiasManutencao
FROM TGFVEI v
LEFT JOIN TCFOSCAB cab ON cab.CODVEICULO = v.CODVEICULO
WHERE v.CODVEICULO = @codveiculo
GROUP BY v.CODVEICULO, v.PLACA, v.MARCAMODELO
`;
