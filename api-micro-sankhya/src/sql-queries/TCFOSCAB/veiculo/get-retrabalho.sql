-- Identificação de Retrabalhos (OS que são retornos da mesma falha)
SELECT * FROM (
  SELECT
    os.NUOS AS nuos,
    os.AD_OSORIGEM AS osOrigem,
    os.DTABERTURA AS dataAbertura,
    os.DATAFIN AS dataFin,
    os.MANUTENCAO AS tipoManutencao,
    os.KM AS km,
    ISNULL(srv.VLRTOT, 0) AS custoTotal,

    -- Motivo do retrabalho (se disponível)
    (SELECT TOP 1 os2.MANUTENCAO
     FROM TCFOSCAB os2
     WHERE os2.NUOS = os.AD_OSORIGEM) AS tipoOrigem,

    -- Dias entre OS original e retrabalho
    DATEDIFF(DAY, osOrig.DATAFIN, os.DATAFIN) AS diasEntreOs,

    ROW_NUMBER() OVER (ORDER BY os.DTABERTURA DESC) AS RowNum
  FROM TCFOSCAB os
  LEFT JOIN TCFOSCAB osOrig ON os.AD_OSORIGEM = osOrig.NUOS
  LEFT JOIN (
    SELECT NUOS, SUM(VLRTOT) AS VLRTOT
    FROM TCFSERVOS
    GROUP BY NUOS
  ) srv ON os.NUOS = srv.NUOS
  WHERE os.CODVEICULO = @codveiculo
    AND os.AD_OSORIGEM IS NOT NULL
    AND os.STATUS = 'F'
) paginated
WHERE RowNum > @OFFSET AND RowNum <= (@OFFSET + @LIMIT)
