-- Análise de Custos por Período para um Veículo
SELECT * FROM (
  SELECT
    YEAR(os.DATAFIN) AS ano,
    MONTH(os.DATAFIN) AS mes,
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
    COUNT(*) AS totalOs,
    SUM(ISNULL(srv.VLRTOT, 0)) AS custoTotal,
    AVG(ISNULL(srv.VLRTOT, 0)) AS custoMedio,
    SUM(os.KM) AS kmTotal,
    AVG(os.KM) AS kmMedio,
    ROW_NUMBER() OVER (ORDER BY YEAR(os.DATAFIN) DESC, MONTH(os.DATAFIN) DESC) AS RowNum
  FROM TCFOSCAB os
  LEFT JOIN (
    SELECT NUOS, SUM(VLRTOT) AS VLRTOT
    FROM TCFSERVOS
    GROUP BY NUOS
  ) srv ON os.NUOS = srv.NUOS
  WHERE os.CODVEICULO = @codveiculo
    AND os.STATUS = 'F'
    AND os.DATAFIN IS NOT NULL
    AND (@dataInicio IS NULL OR os.DATAFIN >= @dataInicio)
    AND (@dataFim IS NULL OR os.DATAFIN <= @dataFim)
  GROUP BY YEAR(os.DATAFIN), MONTH(os.DATAFIN), os.MANUTENCAO
) paginated
WHERE RowNum > @OFFSET AND RowNum <= (@OFFSET + @LIMIT)
