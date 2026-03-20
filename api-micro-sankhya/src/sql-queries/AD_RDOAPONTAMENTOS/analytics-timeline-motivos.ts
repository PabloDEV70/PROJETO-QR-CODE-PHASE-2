/**
 * Minutos por dia por motivo com WTCATEGORIA do banco.
 * Fonte unica para calculo de WT% — frontend usa wtCategoria direto do DB.
 */
export const analyticsTimelineMotivos = `
SELECT
  CONVERT(VARCHAR(10), rdo.DTREF, 23) AS DTREF,
  det.RDOMOTIVOCOD as rdomotivocod,
  ISNULL(mot.WTCATEGORIA, 'externos') as wtCategoria,
  CAST(ISNULL(SUM(CASE WHEN det.HRFIM > det.HRINI AND det.HRFIM <= 2400 THEN
    ((det.HRFIM / 100) * 60 + (det.HRFIM % 100)) -
    ((det.HRINI / 100) * 60 + (det.HRINI % 100))
  ELSE 0 END), 0) AS INT) as totalMinutos
FROM AD_RDOAPONTAMENTOS rdo
INNER JOIN AD_RDOAPONDETALHES det ON rdo.CODRDO = det.CODRDO
LEFT JOIN AD_RDOMOTIVOS mot ON det.RDOMOTIVOCOD = mot.RDOMOTIVOCOD
LEFT JOIN TGFPAR parc ON rdo.CODPARC = parc.CODPARC
LEFT JOIN (
  SELECT CODPARC, CODDEP, CODCARGO, CODFUNCAO, CODEMP,
    ROW_NUMBER() OVER (PARTITION BY CODPARC ORDER BY DTADM DESC) as rn
  FROM TFPFUN WHERE SITUACAO = '1'
) fun ON parc.CODPARC = fun.CODPARC AND fun.rn = 1
WHERE 1=1
AND det.RDOMOTIVOCOD IS NOT NULL
-- @WHERE
GROUP BY rdo.DTREF, det.RDOMOTIVOCOD, mot.WTCATEGORIA
ORDER BY rdo.DTREF ASC, det.RDOMOTIVOCOD ASC
`;
