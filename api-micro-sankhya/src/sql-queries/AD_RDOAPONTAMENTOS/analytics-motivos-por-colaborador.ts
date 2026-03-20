export const analyticsMotivosPorColaborador = `
SELECT TOP @LIMIT
  MIN(rdo.CODRDO) as codrdo,
  rdo.CODPARC as codparc,
  parc.NOMEPARC as nomeparc,
  ISNULL(car.DESCRCARGO, '') as cargo,
  RTRIM(ISNULL(dep.DESCRDEP, '')) as departamento,
  ISNULL(mot.RDOMOTIVOCOD, 0) as rdomotivocod,
  ISNULL(mot.DESCRICAO, 'Sem Motivo') as descricao,
  ISNULL(mot.SIGLA, 'N/A') as sigla,
  ISNULL(mot.WTCATEGORIA, 'externos') as wtCategoria,
  COUNT(det.ITEM) as totalItens,
  CAST(ISNULL(SUM(CASE WHEN det.HRFIM > det.HRINI AND det.HRFIM <= 2400 THEN
    ((det.HRFIM / 100) * 60 + (det.HRFIM % 100)) -
    ((det.HRINI / 100) * 60 + (det.HRINI % 100))
  ELSE 0 END) / 60.0, 0) AS DECIMAL(10,2)) as horasNoMotivo
FROM AD_RDOAPONTAMENTOS rdo
INNER JOIN AD_RDOAPONDETALHES det ON rdo.CODRDO = det.CODRDO
LEFT JOIN AD_RDOMOTIVOS mot ON det.RDOMOTIVOCOD = mot.RDOMOTIVOCOD
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
GROUP BY rdo.CODPARC, parc.NOMEPARC, car.DESCRCARGO, dep.DESCRDEP,
  mot.RDOMOTIVOCOD, mot.DESCRICAO, mot.SIGLA, mot.WTCATEGORIA
ORDER BY rdo.CODPARC, horasNoMotivo DESC
`;
