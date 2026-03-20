/**
 * Lista de OS do veículo para histórico paginado
 */
export const historicoOsList = `
SELECT * FROM (
  SELECT
    cab.NUOS AS nuos,
    CONVERT(VARCHAR(19), cab.DTABERTURA, 120) AS dtAbertura,
    cab.DATAINI AS dataIni,
    cab.DATAFIN AS dataFin,
    cab.STATUS AS status,
    CASE cab.STATUS
      WHEN 'A' THEN 'Aberta'
      WHEN 'E' THEN 'Em Execucao'
      WHEN 'F' THEN 'Finalizada'
      WHEN 'C' THEN 'Cancelada'
      ELSE cab.STATUS
    END AS statusLabel,
    cab.MANUTENCAO AS manutencao,
    CASE cab.MANUTENCAO
      WHEN 'C' THEN 'Corretiva'
      WHEN 'P' THEN 'Preventiva'
      ELSE cab.MANUTENCAO
    END AS manutencaoLabel,
    cab.KM AS km,
    cab.HORIMETRO AS horimetro,
    DATEDIFF(DAY, cab.DATAINI, cab.DATAFIN) AS diasEmManutencao,
    ROW_NUMBER() OVER (ORDER BY cab.DTABERTURA DESC) AS RowNum
  FROM TCFOSCAB cab
  WHERE cab.CODVEICULO = @codveiculo
) AS T
WHERE RowNum > @offset AND RowNum <= (@offset + @limit)
`;
