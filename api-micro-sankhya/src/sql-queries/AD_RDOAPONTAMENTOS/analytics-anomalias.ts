/**
 * Deteccao de anomalias em apontamentos RDO.
 * Identifica registros com horarios invalidos, duracoes negativas/excessivas,
 * e motivos nulos para facilitar correcao pelo usuario.
 */
export const analyticsAnomalias = `
SELECT
  CONVERT(VARCHAR(10), rdo.DTREF, 23) AS DTREF,
  rdo.CODPARC,
  parc.NOMEPARC,
  rdo.CODRDO,
  det.ITEM,
  det.HRINI,
  det.HRFIM,
  mot.DESCRICAO as motivo,
  CASE
    WHEN det.HRFIM > det.HRINI AND det.HRINI >= 400 AND det.HRFIM <= 2400 THEN
      ((det.HRFIM / 100) * 60 + (det.HRFIM % 100)) -
      ((det.HRINI / 100) * 60 + (det.HRINI % 100))
    ELSE 0
  END as minutos,
  CASE
    WHEN det.HRINI < 400 THEN 'HRINI_INVALIDO'
    WHEN det.HRFIM > 2400 THEN 'HRFIM_INVALIDO'
    WHEN det.HRFIM <= det.HRINI THEN 'DURACAO_NEGATIVA'
    WHEN (((det.HRFIM / 100) * 60 + (det.HRFIM % 100)) -
          ((det.HRINI / 100) * 60 + (det.HRINI % 100))) > 600
      THEN 'DURACAO_EXCESSIVA'
    WHEN det.RDOMOTIVOCOD IS NULL THEN 'MOTIVO_NULO'
    ELSE 'DESCONHECIDO'
  END as tipoAnomalia
FROM AD_RDOAPONTAMENTOS rdo
INNER JOIN AD_RDOAPONDETALHES det ON rdo.CODRDO = det.CODRDO
LEFT JOIN AD_RDOMOTIVOS mot ON det.RDOMOTIVOCOD = mot.RDOMOTIVOCOD
LEFT JOIN TGFPAR parc ON rdo.CODPARC = parc.CODPARC
LEFT JOIN (
  SELECT f.CODPARC, f.CODDEP, f.CODCARGO, f.CODFUNCAO, f.CODEMP,
    ROW_NUMBER() OVER (PARTITION BY f.CODPARC ORDER BY f.DTADM DESC) as rn
  FROM TFPFUN f WHERE f.SITUACAO = '1'
) fun ON parc.CODPARC = fun.CODPARC AND fun.rn = 1
WHERE (
  det.HRINI < 400
  OR det.HRFIM > 2400
  OR det.HRFIM <= det.HRINI
  OR (((det.HRFIM / 100) * 60 + (det.HRFIM % 100)) -
      ((det.HRINI / 100) * 60 + (det.HRINI % 100))) > 600
  OR det.RDOMOTIVOCOD IS NULL
)
-- @WHERE
ORDER BY rdo.DTREF DESC, rdo.CODPARC
`;
