/** Sum of productive ATVP minutes for a specific OS service from RDO detalhes */
export const tempoAtvpServico = `
SELECT
  ISNULL(SUM(
    CASE WHEN det.HRFIM > det.HRINI + 1 AND det.HRFIM <= 2400 THEN
      ((det.HRFIM / 100) * 60 + (det.HRFIM % 100)) -
      ((det.HRINI / 100) * 60 + (det.HRINI % 100))
    ELSE 0 END
  ), 0) as totalMinutos
FROM AD_RDOAPONDETALHES det
INNER JOIN AD_RDOMOTIVOS mot ON det.RDOMOTIVOCOD = mot.RDOMOTIVOCOD
WHERE det.NUOS = @nuos
  AND (det.AD_SEQUENCIA_OS = @sequencia OR det.AD_SEQUENCIA_OS IS NULL)
  AND mot.PRODUTIVO = 'S'
  AND det.HRFIM > det.HRINI + 1
`;
