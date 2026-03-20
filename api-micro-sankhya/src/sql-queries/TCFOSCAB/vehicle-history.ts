/**
 * Vehicle OS history - paginated to last 50 items
 * ROW_NUMBER with DESC order, then filter top 50
 * Excludes OBSERVACAO (TEXT field, cannot be in subquery with ROW_NUMBER)
 * Replacement placeholder: @codveiculo
 */
export const vehicleHistory = `
SELECT
  nuos,
  dtabertura,
  datafin,
  status,
  statusLabel,
  manutencao,
  manutencaoLabel,
  horimetro,
  km,
  nomeParc,
  totalServicos
FROM (
  SELECT
    os.NUOS as nuos,
    os.DTABERTURA as dtabertura,
    os.DATAFIN as datafin,
    os.STATUS as status,
    CASE os.STATUS
      WHEN 'F' THEN 'Finalizada'
      WHEN 'A' THEN 'Aberta'
      WHEN 'E' THEN 'Em Execucao'
      WHEN 'C' THEN 'Cancelada'
      ELSE os.STATUS
    END as statusLabel,
    os.MANUTENCAO as manutencao,
    CASE os.MANUTENCAO
      WHEN 'P' THEN 'Preventiva'
      WHEN 'C' THEN 'Corretiva'
      WHEN 'R' THEN 'Reforma'
      WHEN 'S' THEN 'Socorro'
      WHEN 'T' THEN 'Retorno'
      WHEN 'O' THEN 'Outros'
      ELSE os.MANUTENCAO
    END as manutencaoLabel,
    os.HORIMETRO as horimetro,
    os.KM as km,
    p.NOMEPARC as nomeParc,
    (
      SELECT COUNT(*)
      FROM TCFSERVOS srv
      WHERE srv.NUOS = os.NUOS
    ) as totalServicos,
    ROW_NUMBER() OVER (ORDER BY os.DTABERTURA DESC) AS rn
  FROM TCFOSCAB os
  LEFT JOIN TGFPAR p ON os.CODPARC = p.CODPARC
  WHERE os.CODVEICULO = @codveiculo
) AS ranked
WHERE rn <= 50
ORDER BY dtabertura DESC
`;
