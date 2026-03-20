export const osManutencaoPorParceiro = `
  SELECT * FROM (
    SELECT
      os.NUOS,
      CONVERT(VARCHAR(19), os.DTABERTURA, 120) AS DTABERTURA,
      os.STATUS,
      os.CODVEICULO,
      v.PLACA,
      v.MARCAMODELO,
      CASE os.STATUS WHEN 'F' THEN 'Finalizada' ELSE 'Aberta' END as statusLabel,
      ROW_NUMBER() OVER (ORDER BY os.DTABERTURA DESC) AS RowNum
    FROM TCFOSCAB os
    LEFT JOIN TGFVEI v ON os.CODVEICULO = v.CODVEICULO
    WHERE os.CODPARC = @codparc
    -- @WHERE
  ) AS T
  WHERE RowNum > @OFFSET AND RowNum <= (@OFFSET + @LIMIT)
`;
