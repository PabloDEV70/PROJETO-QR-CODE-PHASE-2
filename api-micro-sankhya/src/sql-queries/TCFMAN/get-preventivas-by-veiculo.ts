/**
 * Busca preventivas de um veículo específico
 * Retorna planos com dados da última manutenção realizada
 */
export const getPreventivasByVeiculo = `
SELECT
  v.CODVEICULO AS codveiculo,
  v.PLACA AS placa,
  CAST(v.MARCAMODELO AS VARCHAR(100)) AS tipoEquipamento,
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
WHERE v.CODVEICULO = @codveiculo
  AND man.AD_AGRUPADOR IS NOT NULL
  AND man.ATIVO = 'S'
ORDER BY man.AD_AGRUPADOR
`;
