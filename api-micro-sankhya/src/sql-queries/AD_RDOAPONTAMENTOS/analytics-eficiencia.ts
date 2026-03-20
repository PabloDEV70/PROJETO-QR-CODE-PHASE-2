export const analyticsEficiencia = `
SELECT TOP @LIMIT
  rdo.CODPARC as codparc,
  parc.NOMEPARC as nomeparc,
  COUNT(det.ITEM) as totalItens,
  COUNT(DISTINCT rdo.CODRDO) as totalRdos,
  CAST(ISNULL(AVG(CAST(
    CASE WHEN det.HRFIM > det.HRINI AND det.HRFIM <= 2400 THEN
      ((det.HRFIM / 100) * 60 + (det.HRFIM % 100)) -
      ((det.HRINI / 100) * 60 + (det.HRINI % 100))
    ELSE 0 END AS FLOAT)), 0) AS DECIMAL(10,2)) as mediaMinutosPorItem,
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
  COUNT(DISTINCT det.RDOMOTIVOCOD) as motivosDiferentes,
  CAST(COUNT(det.ITEM) * 1.0 / NULLIF(COUNT(DISTINCT rdo.CODRDO), 0) AS DECIMAL(10,2)) as mediaItensPorRdo
FROM AD_RDOAPONTAMENTOS rdo
INNER JOIN AD_RDOAPONDETALHES det ON rdo.CODRDO = det.CODRDO
LEFT JOIN TGFPAR parc ON rdo.CODPARC = parc.CODPARC
LEFT JOIN (
  SELECT CODPARC, CODDEP, CODCARGO, CODFUNCAO, CODEMP,
    ROW_NUMBER() OVER (PARTITION BY CODPARC ORDER BY DTADM DESC) as rn
  FROM TFPFUN WHERE SITUACAO = '1'
) fun ON parc.CODPARC = fun.CODPARC AND fun.rn = 1
WHERE 1=1
-- @WHERE
GROUP BY rdo.CODPARC, parc.NOMEPARC
ORDER BY -- @ORDER
`;
