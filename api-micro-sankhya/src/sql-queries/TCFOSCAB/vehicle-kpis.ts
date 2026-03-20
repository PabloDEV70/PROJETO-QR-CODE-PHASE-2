/**
 * Vehicle-scoped KPIs: Total OS, MTTR, MTBF
 * MTTR: Average repair time for finalized OS (STATUS='F')
 * MTBF: Self-join ROW_NUMBER pattern for consecutive corrective failures
 * Replacement placeholder: @codveiculo
 */
export const vehicleKpis = `
SELECT
  v.CODVEICULO as codveiculo,
  v.PLACA as placa,
  CAST(v.MARCAMODELO AS VARCHAR(MAX)) as marca,
  v.AD_TAG as tag,
  v.AD_TIPOEQPTO as tipo,
  (
    SELECT COUNT(*)
    FROM TCFOSCAB os
    WHERE os.CODVEICULO = v.CODVEICULO
  ) as totalOS,
  (
    SELECT AVG(CAST(DATEDIFF(HOUR, os.DATAINI, os.DATAFIN) AS FLOAT))
    FROM TCFOSCAB os
    WHERE os.CODVEICULO = v.CODVEICULO
      AND os.STATUS = 'F'
      AND os.DATAINI IS NOT NULL
      AND os.DATAFIN IS NOT NULL
      AND DATEDIFF(HOUR, os.DATAINI, os.DATAFIN) > 0
  ) as mttrHoras,
  (
    SELECT AVG(CAST(DATEDIFF(DAY, os1.DATAFIN, os2.DATAFIN) AS FLOAT))
    FROM (
      SELECT
        NUOS,
        CODVEICULO,
        DATAFIN,
        ROW_NUMBER() OVER (PARTITION BY CODVEICULO ORDER BY DATAFIN) AS rn
      FROM TCFOSCAB
      WHERE CODVEICULO = v.CODVEICULO
        AND STATUS = 'F'
        AND MANUTENCAO = 'C'
        AND DATAFIN IS NOT NULL
    ) os1
    INNER JOIN (
      SELECT
        NUOS,
        CODVEICULO,
        DATAFIN,
        ROW_NUMBER() OVER (PARTITION BY CODVEICULO ORDER BY DATAFIN) AS rn
      FROM TCFOSCAB
      WHERE CODVEICULO = v.CODVEICULO
        AND STATUS = 'F'
        AND MANUTENCAO = 'C'
        AND DATAFIN IS NOT NULL
    ) os2
      ON os1.CODVEICULO = os2.CODVEICULO
      AND os2.rn = os1.rn + 1
    WHERE DATEDIFF(DAY, os1.DATAFIN, os2.DATAFIN) > 0
  ) as mtbfDias
FROM TGFVEI v
WHERE v.CODVEICULO = @codveiculo
`;
