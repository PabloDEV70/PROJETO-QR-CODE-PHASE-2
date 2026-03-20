-- Score de Aderência ao Plano de Manutenção
SELECT * FROM (
  SELECT
    @codveiculo AS codveiculo,
    COUNT(*) AS totalOs,
    SUM(CASE WHEN dentroPrazo = 1 THEN 1 ELSE 0 END) AS osNoPrazo,
    CAST(100.0 * SUM(CASE WHEN dentroPrazo = 1 THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0) AS DECIMAL(5,2)) AS scoreAderencia,
    AVG(diasAtraso) AS mediaDiasAtraso,
    MAX(diasAtraso) AS maxDiasAtraso,
    ROW_NUMBER() OVER (ORDER BY COUNT(*)) AS RowNum
  FROM (
    SELECT
      os.NUOS,
      os.DATAFIN,
      os.KM,
      osAnterior.DATAFIN AS dataAnterior,
      osAnterior.KM AS kmAnterior,
      osAnterior.NUPLANO,
      man.TIPO,
      man.TEMPO AS intervaloDias,
      man.KMHORIMETRO AS intervaloKm,

      -- Verificar se está dentro do prazo
      CASE
        WHEN osAnterior.DATAFIN IS NULL THEN 1
        WHEN man.TIPO IN ('T', 'KT') THEN
          CASE
            WHEN DATEDIFF(DAY, osAnterior.DATAFIN, os.DATAFIN) <= man.TEMPO THEN 1
            ELSE 0
          END
        WHEN man.TIPO IN ('K', 'KT') THEN
          CASE
            WHEN os.KM - osAnterior.KM <= man.KMHORIMETRO THEN 1
            ELSE 0
          END
        ELSE 1
      END AS dentroPrazo,

      -- Dias de atraso (positivo = atraso)
      CASE
        WHEN osAnterior.DATAFIN IS NULL THEN 0
        WHEN man.TIPO IN ('T', 'KT') THEN
          DATEDIFF(DAY, osAnterior.DATAFIN, os.DATAFIN) - man.TEMPO
        ELSE 0
      END AS diasAtraso
    FROM TCFOSCAB os
    INNER JOIN TCFMAN man ON os.NUPLANO = man.NUPLANO
    LEFT JOIN TCFOSCAB osAnterior ON osAnterior.CODVEICULO = os.CODVEICULO
      AND osAnterior.NUPLANO = man.NUPLANO
      AND osAnterior.DATAFIN < os.DATAFIN
      AND osAnterior.STATUS = 'F'
    WHERE os.CODVEICULO = @codveiculo
      AND os.STATUS = 'F'
      AND os.DATAFIN IS NOT NULL
      AND os.NUPLANO IS NOT NULL
  ) analise
WHERE RowNum = 1
