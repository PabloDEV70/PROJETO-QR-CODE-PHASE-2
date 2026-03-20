export const analyticsMotivos = `
SELECT
  ISNULL(mot.RDOMOTIVOCOD, 0) as rdomotivocod,
  ISNULL(mot.DESCRICAO, 'Sem Motivo') as descricao,
  ISNULL(mot.SIGLA, 'N/A') as sigla,
  ISNULL(mot.PRODUTIVO, 'N') as produtivo,
  ISNULL(mot.TOLERANCIA, 0) as tolerancia,
  ISNULL(mot.PENALIDADE, 0) as penalidadeMin,
  ISNULL(mot.WTCATEGORIA, 'externos') as wtCategoria,
  COUNT(det.ITEM) as totalItens,
  COUNT(DISTINCT rdo.CODRDO) as rdosComMotivo,
  CAST(ISNULL(SUM(CASE WHEN det.HRFIM > det.HRINI AND det.HRFIM <= 2400 THEN
    ((det.HRFIM / 100) * 60 + (det.HRFIM % 100)) -
    ((det.HRINI / 100) * 60 + (det.HRINI % 100))
  ELSE 0 END) / 60.0, 0) AS DECIMAL(10,2)) as totalHoras,
  CAST(ISNULL(AVG(CAST(
    CASE WHEN det.HRFIM > det.HRINI AND det.HRFIM <= 2400 THEN
      ((det.HRFIM / 100) * 60 + (det.HRFIM % 100)) -
      ((det.HRINI / 100) * 60 + (det.HRINI % 100))
    ELSE 0 END AS FLOAT)), 0) AS DECIMAL(10,2)) as mediaMinutosPorItem
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
-- @WHERE
GROUP BY mot.RDOMOTIVOCOD, mot.DESCRICAO, mot.SIGLA, mot.PRODUTIVO, mot.TOLERANCIA, mot.PENALIDADE, mot.WTCATEGORIA
HAVING COUNT(det.ITEM) > 0
ORDER BY totalHoras DESC
`;
