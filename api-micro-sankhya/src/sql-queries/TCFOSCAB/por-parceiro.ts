export const porParceiro = `
SELECT * FROM (
  SELECT
    os.NUOS,
    CONVERT(VARCHAR(19), os.DTABERTURA, 120) AS DTABERTURA,
    os.DATAINI,
    CONVERT(VARCHAR(19), os.DATAFIN, 120) AS DATAFIN,
    os.STATUS,
    os.MANUTENCAO,
    os.AD_STATUSGIG,
    os.AD_FINALIZACAO,
    os.CODVEICULO,
    os.KM,
    os.HORIMETRO,
    v.PLACA as placa,
    CAST(v.MARCAMODELO AS VARCHAR(MAX)) as marcaModelo,
    CASE os.STATUS
      WHEN 'F' THEN 'Finalizada'
      WHEN 'A' THEN 'Aberta'
      WHEN 'E' THEN 'Em Execucao'
      WHEN 'C' THEN 'Cancelada'
      ELSE os.STATUS
    END as statusLabel,
    CASE os.MANUTENCAO
      WHEN 'P' THEN 'Preventiva'
      WHEN 'C' THEN 'Corretiva'
      WHEN 'R' THEN 'Reforma'
      WHEN 'S' THEN 'Socorro'
      WHEN 'T' THEN 'Retorno'
      WHEN 'O' THEN 'Outros'
      ELSE os.MANUTENCAO
    END as manutencaoLabel,
    (
      SELECT COUNT(*)
      FROM TCFSERVOS srv
      WHERE srv.NUOS = os.NUOS
    ) as totalServicos,
    ROW_NUMBER() OVER (ORDER BY os.DTABERTURA DESC) AS RowNum
  FROM TCFOSCAB os
  LEFT JOIN TGFVEI v ON os.CODVEICULO = v.CODVEICULO
  WHERE os.CODPARC = @codparc
) AS T
WHERE RowNum > @OFFSET AND RowNum <= (@OFFSET + @LIMIT)
`;
