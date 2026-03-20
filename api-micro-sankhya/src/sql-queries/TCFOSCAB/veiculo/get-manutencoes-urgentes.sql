-- OS Urgentes/Atrasadas da Frota
SELECT * FROM (
  SELECT
    os.CODVEICULO AS codveiculo,
    vei.PLACA AS placa,
    vei.AD_TAG AS adTag,
    os.NUOS AS nuos,
    os.DTABERTURA AS dataAbertura,
    DATEDIFF(DAY, os.DTABERTURA, GETDATE()) AS diasAberto,
    os.AD_STATUSGIG AS statusGig,
    os.STATUS AS status,
    os.MANUTENCAO AS tipoManutencao,
    os.KM AS km,
    (SELECT TOP 1 ISNULL(SUM(VLRTOT), 0) FROM TCFSERVOS WHERE NUOS = os.NUOS) AS custoParcial,
    ROW_NUMBER() OVER (ORDER BY os.DTABERTURA ASC) AS RowNum
  FROM TCFOSCAB os
  INNER JOIN TGFVEI vei ON os.CODVEICULO = vei.CODVEICULO
  WHERE os.STATUS <> 'F'
    AND vei.AD_EXIBEDASH = 'S'
    AND (
      -- OS aberta há mais de 7 dias
      DATEDIFF(DAY, os.DTABERTURA, GETDATE()) > 7
      -- Ou status Gig crítico
      OR os.AD_STATUSGIG IN ('AI', 'AV', 'SI')
    )
) paginated
WHERE RowNum > @OFFSET AND RowNum <= (@OFFSET + @LIMIT)
