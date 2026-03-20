export const detalhesPorPeriodoCount = `
SELECT
  COUNT(*) as totalRegistros,
  ISNULL(SUM(CASE WHEN det.HRFIM > det.HRINI AND det.HRFIM <= 2400 THEN
    ((det.HRFIM / 100) * 60 + (det.HRFIM % 100)) -
    ((det.HRINI / 100) * 60 + (det.HRINI % 100))
  ELSE 0 END), 0) as totalMinutos,
  ISNULL(SUM(CASE WHEN det.HRFIM > det.HRINI AND det.HRFIM <= 2400 THEN
    ((det.HRFIM / 100) * 60 + (det.HRFIM % 100)) -
    ((det.HRINI / 100) * 60 + (det.HRINI % 100))
  ELSE 0 END) / 60.0, 0) as totalHoras
FROM AD_RDOAPONDETALHES det
INNER JOIN AD_RDOAPONTAMENTOS rdo ON det.CODRDO = rdo.CODRDO
LEFT JOIN TGFPAR parc ON rdo.CODPARC = parc.CODPARC
LEFT JOIN (
  SELECT CODPARC, CODDEP, CODCARGO, CODFUNCAO, CODEMP,
    ROW_NUMBER() OVER (PARTITION BY CODPARC ORDER BY DTADM DESC) as rn
  FROM TFPFUN
  WHERE SITUACAO = '1'
) fun ON parc.CODPARC = fun.CODPARC AND fun.rn = 1
WHERE 1=1
-- @WHERE
`;
