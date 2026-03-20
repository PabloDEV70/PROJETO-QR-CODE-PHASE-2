-- Próxima Manutenção Baseada no Plano
-- Calcula quando será a próxima manutenção do veículo
SELECT * FROM (
  SELECT
    man.NUPLANO AS nuplano,
    man.DESCRICAO AS descricao,
    man.TIPO AS tipo,
    CASE man.TIPO
      WHEN 'T' THEN 'Tempo'
      WHEN 'K' THEN 'Quilometragem'
      WHEN 'H' THEN 'Horímetro'
      WHEN 'KT' THEN 'Híbrido (KM/Tempo)'
      ELSE man.TIPO
    END AS tipoLabel,
    man.TEMPO AS intervaloDias,
    man.KMHORIMETRO AS intervaloKm,
    man.PERCTOLERANCIA AS percentualTolerancia,

    vei.KMACUM AS kmVeiculo,

    -- Última OS do plano
    ultOs.ultimaData AS dataUltima,
    ultOs.ultimaKm AS kmUltima,

    -- Status da manutenção
    CASE
      WHEN ultOs.ultimaData IS NULL THEN 'SEM_PLANO'
      WHEN man.TIPO IN ('T', 'KT') THEN
        CASE
          WHEN DATEDIFF(DAY, ultOs.ultimaData, GETDATE()) > man.TEMPO THEN 'ATRASADA'
          WHEN DATEDIFF(DAY, ultOs.ultimaData, GETDATE()) > man.TEMPO - 7 THEN 'PROXIMO_VENCER'
          ELSE 'EM_DIA'
        END
      WHEN man.TIPO IN ('K', 'KT') THEN
        CASE
          WHEN vei.KMACUM - ultOs.ultimaKm >= man.KMHORIMETRO THEN 'ATRASADA'
          WHEN vei.KMACUM - ultOs.ultimaKm >= man.KMHORIMETRO - 500 THEN 'PROXIMO_VENCER'
          ELSE 'EM_DIA'
        END
      ELSE 'CONFERIR'
    END AS statusManutencao,

    -- Próxima data/km prevista
    DATEADD(DAY, man.TEMPO, ultOs.ultimaData) AS dataProxima,
    ultOs.ultimaKm + man.KMHORIMETRO AS kmProximo,

    -- Dias/KM de atraso
    CASE
      WHEN ultOs.ultimaData IS NULL THEN NULL
      WHEN man.TIPO IN ('T', 'KT') THEN
        DATEDIFF(DAY, ultOs.ultimaData, GETDATE()) - man.TEMPO
      ELSE NULL
    END AS diasAtraso,

    CASE
      WHEN ultOs.ultimaKm IS NULL THEN NULL
      WHEN man.TIPO IN ('K', 'KT') THEN
        vei.KMACUM - ultOs.ultimaKm - man.KMHORIMETRO
      ELSE NULL
    END AS kmAtraso,

    ROW_NUMBER() OVER (ORDER BY man.NUPLANO) AS RowNum
  FROM TCFMAN man
  INNER JOIN TGFVEI vei ON man.CODVEICULO = vei.CODVEICULO
  LEFT JOIN (
    SELECT
      os1.CODVEICULO,
      os1.NUPLANO,
      os1.DATAFIN AS ultimaData,
      os1.KM AS ultimaKm
    FROM TCFOSCAB os1
    INNER JOIN (
      SELECT CODVEICULO, NUPLANO, MAX(DATAFIN) AS maxData
      FROM TCFOSCAB
      WHERE STATUS = 'F'
        AND NUPLANO IS NOT NULL
      GROUP BY CODVEICULO, NUPLANO
    ) os2 ON os1.CODVEICULO = os2.CODVEICULO
      AND os1.NUPLANO = os2.NUPLANO
      AND os1.DATAFIN = os2.maxData
  ) ultOs ON man.CODVEICULO = ultOs.CODVEICULO
    AND man.NUPLANO = ultOs.NUPLANO
  WHERE man.CODVEICULO = @codveiculo
    AND man.REPETIR = 'S'
) paginated
WHERE RowNum = 1
