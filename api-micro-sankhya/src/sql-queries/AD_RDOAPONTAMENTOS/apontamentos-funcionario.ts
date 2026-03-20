export const apontamentosFuncionario = `
SELECT
  CONVERT(VARCHAR(10), rdo.DTREF, 120) AS dtref,
  DATEPART(dw, rdo.DTREF) AS diasem,
  det.ITEM AS item,
  det.HRINI AS hrini,
  det.HRFIM AS hrfim,
  CASE WHEN det.HRFIM > det.HRINI AND det.HRFIM <= 2400 THEN
    ((det.HRFIM / 100) * 60 + (det.HRFIM % 100)) -
    ((det.HRINI / 100) * 60 + (det.HRINI % 100))
  ELSE 0 END AS duracaoMinutos,
  det.RDOMOTIVOCOD AS rdomotivocod,
  mot.DESCRICAO AS motivoDescricao,
  mot.SIGLA AS motivoSigla,
  det.NUOS AS nuos,
  det.OBS AS obs
FROM AD_RDOAPONDETALHES det
INNER JOIN AD_RDOAPONTAMENTOS rdo ON det.CODRDO = rdo.CODRDO
LEFT JOIN AD_RDOMOTIVOS mot ON det.RDOMOTIVOCOD = mot.RDOMOTIVOCOD
WHERE rdo.CODPARC = @codparc
-- @WHERE
ORDER BY rdo.DTREF, det.HRINI
`;
