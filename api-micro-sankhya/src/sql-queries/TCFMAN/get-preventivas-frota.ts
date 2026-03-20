/**
 * Busca preventivas de TODOS os veiculos ativos da frota
 * Retorna ~800 rows (200 veiculos x ~4 codigos preventivos)
 * Agrupado por CODVEICULO + AD_AGRUPADOR
 */
export const getPreventivasFrota = `
SELECT
  v.CODVEICULO AS codveiculo,
  v.PLACA AS placa,
  CAST(v.MARCAMODELO AS VARCHAR(100)) AS marcaModelo,
  v.AD_TIPOEQPTO AS tipoEquipamento,
  CAST(v.AD_TAG AS VARCHAR(50)) AS tag,
  man.AD_AGRUPADOR AS codigo,
  man.DESCRICAO AS descricao,
  man.TIPO AS tipoIntervalo,
  ISNULL(man.TEMPO, 0) AS intervaloDias,
  ISNULL(man.KMHORIMETRO, 0) AS intervaloKm,
  ISNULL(man.PERCTOLERANCIA, 10) AS tolerancia,
  ult.DATAFIN AS ultimaData,
  ult.KM AS ultimoKm,
  ult.NUOS AS ultimaOs
FROM TGFVEI v
CROSS JOIN TCFMAN man
OUTER APPLY (
  SELECT TOP 1 osi.DATAFIN, osi.KM, osi.NUOS
  FROM TCFOSCAB osi
  WHERE osi.CODVEICULO = v.CODVEICULO
    AND osi.NUPLANO = man.NUPLANO
    AND osi.STATUS = 'F'
  ORDER BY osi.DATAFIN DESC
) ult
WHERE v.ATIVO = 'S'
  AND v.AD_EXIBEDASH = 'S'
  AND man.AD_AGRUPADOR IS NOT NULL
  AND man.ATIVO = 'S'
ORDER BY v.AD_TIPOEQPTO, v.PLACA, man.AD_AGRUPADOR
`;
