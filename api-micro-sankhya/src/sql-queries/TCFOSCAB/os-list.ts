export const osList = `
SELECT TOP @LIMIT * FROM (
  SELECT
    os.NUOS,
    os.STATUS,
    os.MANUTENCAO,
    os.TIPO,
    os.DTABERTURA,
    os.DATAINI,
    os.DATAFIN,
    os.PREVISAO,
    os.DHALTER,
    os.KM,
    os.HORIMETRO,
    os.CODVEICULO,
    os.CODPARC,
    os.CODMOTORISTA,
    os.NUPLANO,
    os.AD_STATUSGIG,
    os.AD_BLOQUEIOS,
    os.AD_LOCALMANUTENCAO,
    os.AD_OSORIGEM,
    os.AD_FINALIZACAO,
    os.CODEMP,
    v.PLACA,
    CAST(v.MARCAMODELO AS VARCHAR(200)) AS MARCAMODELO,
    v.AD_TAG,
    CASE os.STATUS
      WHEN 'A' THEN 'Aberta'
      WHEN 'E' THEN 'Em Execucao'
      WHEN 'F' THEN 'Finalizada'
      WHEN 'C' THEN 'Cancelada'
      WHEN 'R' THEN 'Reaberta'
      ELSE os.STATUS
    END AS statusLabel,
    CASE os.MANUTENCAO
      WHEN 'C' THEN 'Corretiva'
      WHEN 'P' THEN 'Preventiva'
      WHEN 'O' THEN 'Outros'
      WHEN 'S' THEN 'Socorro'
      WHEN 'R' THEN 'Reforma'
      WHEN 'T' THEN 'Retorno'
      WHEN '1' THEN 'Rev. Garantia'
      WHEN '2' THEN 'Corretiva Prog.'
      WHEN '3' THEN 'Inventariado'
      WHEN '4' THEN 'Logistica'
      WHEN '5' THEN 'Borracharia'
      ELSE os.MANUTENCAO
    END AS manutencaoLabel,
    CASE os.TIPO
      WHEN 'I' THEN 'Interna'
      WHEN 'E' THEN 'Externa'
      ELSE os.TIPO
    END AS tipoLabel,
    ISNULL(srvAgg.TOTAL_SERVICOS, 0) AS TOTAL_SERVICOS,
    ISNULL(srvAgg.CUSTO_TOTAL, 0) AS CUSTO_TOTAL,
    ROW_NUMBER() OVER (ORDER BY os.DTABERTURA DESC) AS RowNum
  FROM TCFOSCAB os
  LEFT JOIN TGFVEI v ON os.CODVEICULO = v.CODVEICULO
  LEFT JOIN (
    SELECT NUOS, COUNT(*) AS TOTAL_SERVICOS, SUM(ISNULL(VLRTOT, 0)) AS CUSTO_TOTAL
    FROM TCFSERVOS GROUP BY NUOS
  ) srvAgg ON srvAgg.NUOS = os.NUOS
  WHERE 1=1
  -- @WHERE
) AS T
WHERE RowNum > @OFFSET AND RowNum <= (@OFFSET + @LIMIT)
`;
