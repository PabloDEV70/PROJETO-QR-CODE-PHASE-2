export const analyticsProdutividade = `
SELECT TOP @LIMIT
  rdo.CODPARC as codparc,
  parc.NOMEPARC as nomeparc,
  COUNT(DISTINCT rdo.CODRDO) as totalRdos,
  COUNT(det.ITEM) as totalItens,
  ISNULL(SUM(CASE WHEN det.HRFIM > det.HRINI AND det.HRFIM <= 2400 THEN
    ((det.HRFIM / 100) * 60 + (det.HRFIM % 100)) -
    ((det.HRINI / 100) * 60 + (det.HRINI % 100))
  ELSE 0 END), 0) as totalMinutos,
  CAST(ISNULL(SUM(CASE WHEN det.HRFIM > det.HRINI AND det.HRFIM <= 2400 THEN
    ((det.HRFIM / 100) * 60 + (det.HRFIM % 100)) -
    ((det.HRINI / 100) * 60 + (det.HRINI % 100))
  ELSE 0 END) / 60.0, 0) AS DECIMAL(10,2)) as totalHoras,
  CAST(ISNULL(AVG(CAST(
    CASE WHEN det.HRFIM > det.HRINI AND det.HRFIM <= 2400 THEN
      ((det.HRFIM / 100) * 60 + (det.HRFIM % 100)) -
      ((det.HRINI / 100) * 60 + (det.HRINI % 100))
    ELSE 0 END AS FLOAT)), 0) AS DECIMAL(10,2)) as mediaMinutosPorItem,
  CAST(ISNULL(SUM(CASE WHEN det.HRFIM > det.HRINI AND det.HRFIM <= 2400 THEN
    ((det.HRFIM / 100) * 60 + (det.HRFIM % 100)) -
    ((det.HRINI / 100) * 60 + (det.HRINI % 100))
  ELSE 0 END) / 60.0 / NULLIF(COUNT(DISTINCT rdo.CODRDO), 0), 0) AS DECIMAL(10,2)) as mediaHorasPorRdo,
  CAST(ISNULL(STDEV(CAST(
    CASE WHEN det.HRFIM > det.HRINI AND det.HRFIM <= 2400 THEN
      ((det.HRFIM / 100) * 60 + (det.HRFIM % 100)) -
      ((det.HRINI / 100) * 60 + (det.HRINI % 100))
    ELSE 0 END AS FLOAT)), 0) AS DECIMAL(10,2)) as desvioPadrao,
  SUM(CASE WHEN det.HRFIM > det.HRINI AND det.HRFIM <= 2400 AND
    ((det.HRFIM / 100) * 60 + (det.HRFIM % 100)) -
    ((det.HRINI / 100) * 60 + (det.HRINI % 100)) < 30
  THEN 1 ELSE 0 END) as itensCurtos,
  CAST(SUM(CASE WHEN det.HRFIM > det.HRINI AND det.HRFIM <= 2400 AND
    ((det.HRFIM / 100) * 60 + (det.HRFIM % 100)) -
    ((det.HRINI / 100) * 60 + (det.HRINI % 100)) < 30
  THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(det.ITEM), 0) AS DECIMAL(10,2)) as percentualCurtos,
  SUM(CASE WHEN det.NUOS IS NOT NULL THEN 1 ELSE 0 END) as itensComOs,
  SUM(CASE WHEN det.NUOS IS NULL THEN 1 ELSE 0 END) as itensSemOs,
  CAST(SUM(CASE WHEN det.NUOS IS NOT NULL THEN 1 ELSE 0 END) * 100.0
    / NULLIF(COUNT(det.ITEM), 0) AS DECIMAL(10,2)) as percentualComOs,
  dep.DESCRDEP as departamento,
  car.DESCRCARGO as cargo
FROM AD_RDOAPONTAMENTOS rdo
INNER JOIN AD_RDOAPONDETALHES det ON rdo.CODRDO = det.CODRDO
LEFT JOIN TGFPAR parc ON rdo.CODPARC = parc.CODPARC
LEFT JOIN (
  SELECT CODPARC, CODDEP, CODCARGO, CODFUNCAO, CODEMP,
    ROW_NUMBER() OVER (PARTITION BY CODPARC ORDER BY DTADM DESC) as rn
  FROM TFPFUN WHERE SITUACAO = '1'
) fun ON parc.CODPARC = fun.CODPARC AND fun.rn = 1
LEFT JOIN TFPCAR car ON fun.CODCARGO = car.CODCARGO
LEFT JOIN TFPDEP dep ON fun.CODDEP = dep.CODDEP
WHERE 1=1
-- @WHERE
GROUP BY rdo.CODPARC, parc.NOMEPARC, dep.DESCRDEP, car.DESCRCARGO
ORDER BY -- @ORDER
`;
