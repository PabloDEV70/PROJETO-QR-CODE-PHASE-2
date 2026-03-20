export const analyticsComparativo = `
SELECT
  COUNT(DISTINCT rdo.CODRDO) as totalRdos,
  COUNT(DISTINCT rdo.CODPARC) as totalColaboradores,
  COUNT(det.ITEM) as totalDetalhes,
  CAST(ISNULL(SUM(CASE WHEN det.HRFIM > det.HRINI AND det.HRFIM <= 2400 THEN
    ((det.HRFIM / 100) * 60 + (det.HRFIM % 100)) -
    ((det.HRINI / 100) * 60 + (det.HRINI % 100))
  ELSE 0 END) / 60.0, 0) AS DECIMAL(10,2)) as totalHoras,
  ISNULL(AVG(CAST(
    CASE WHEN det.HRFIM > det.HRINI AND det.HRFIM <= 2400 THEN
      ((det.HRFIM / 100) * 60 + (det.HRFIM % 100)) -
      ((det.HRINI / 100) * 60 + (det.HRINI % 100))
    ELSE 0 END AS FLOAT)
  ), 0) as mediaMinutosPorItem,
  SUM(CASE WHEN det.NUOS IS NOT NULL THEN 1 ELSE 0 END) as itensComOs,
  COUNT(DISTINCT rdo.DTREF) as diasComDados
FROM AD_RDOAPONTAMENTOS rdo
LEFT JOIN AD_RDOAPONDETALHES det ON rdo.CODRDO = det.CODRDO
LEFT JOIN TGFPAR parc ON rdo.CODPARC = parc.CODPARC
LEFT JOIN (
  SELECT CODPARC, CODDEP, CODCARGO, CODFUNCAO, CODEMP,
    ROW_NUMBER() OVER (PARTITION BY CODPARC ORDER BY DTADM DESC) as rn
  FROM TFPFUN WHERE SITUACAO = '1'
) fun ON parc.CODPARC = fun.CODPARC AND fun.rn = 1
WHERE rdo.DTREF >= '@dataInicio' AND rdo.DTREF <= '@dataFim'
-- @WHERE
`;
