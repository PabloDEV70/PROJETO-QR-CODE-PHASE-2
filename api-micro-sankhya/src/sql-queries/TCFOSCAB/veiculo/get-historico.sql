-- Histórico de OS do Veículo com Paginação
SELECT * FROM (
  SELECT
    os.NUOS AS nuos,
    os.DTABERTURA AS dataAbertura,
    os.DATAINI AS dataInicio,
    os.DATAFIN AS dataFin,
    os.STATUS AS status,
    CASE os.STATUS
      WHEN 'A' THEN 'Aberta'
      WHEN 'E' THEN 'Em Execução'
      WHEN 'F' THEN 'Finalizada'
      WHEN 'C' THEN 'Cancelada'
      ELSE os.STATUS
    END AS statusLabel,
    os.AD_STATUSGIG AS statusGig,
    os.MANUTENCAO AS tipoManutencao,
    CASE os.MANUTENCAO
      WHEN 'P' THEN 'Preventiva'
      WHEN 'C' THEN 'Corretiva'
      WHEN '2' THEN 'Corretiva Programada'
      WHEN '5' THEN 'Borracharia'
      WHEN '1' THEN 'Revisão Garantia'
      WHEN 'R' THEN 'Reforma'
      WHEN 'S' THEN 'Socorro'
      WHEN 'O' THEN 'Outros'
      ELSE os.MANUTENCAO
    END AS tipoManutencaoLabel,
    os.KM AS km,
    os.HORIMETRO AS horimetro,
    ISNULL(srv.VLRTOT, 0) AS custoTotal,
    DATEDIFF(DAY, os.DTABERTURA, ISNULL(os.DATAFIN, GETDATE())) AS diasAberto,

    -- Verificar se é retrabalho
    CASE WHEN os.AD_OSORIGEM IS NOT NULL THEN 1 ELSE 0 END AS isRetrabalho,
    os.AD_OSORIGEM AS osOrigem,

    -- Informações do serviço principal
    (SELECT TOP 1 srv2.DESCRPROD
     FROM TCFSERVOS srv2
     WHERE srv2.NUOS = os.NUOS) AS servicoPrincipal,

    ROW_NUMBER() OVER (ORDER BY os.DTABERTURA DESC) AS RowNum
  FROM TCFOSCAB os
  LEFT JOIN (
    SELECT NUOS, SUM(VLRTOT) AS VLRTOT
    FROM TCFSERVOS
    GROUP BY NUOS
  ) srv ON os.NUOS = srv.NUOS
  WHERE os.CODVEICULO = @codveiculo
    AND (@status IS NULL OR os.STATUS = @status)
    AND (@tipo IS NULL OR os.MANUTENCAO = @tipo)
    AND (@dataInicio IS NULL OR os.DTABERTURA >= @dataInicio)
    AND (@dataFim IS NULL OR os.DTABERTURA <= @dataFim)
) paginated
WHERE RowNum > @OFFSET AND RowNum <= (@OFFSET + @LIMIT)
