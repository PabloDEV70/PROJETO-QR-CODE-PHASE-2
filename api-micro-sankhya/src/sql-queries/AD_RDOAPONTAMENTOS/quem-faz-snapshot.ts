/**
 * "Quem faz o quê" — split into simple queries the API Mother can handle.
 *
 * API Mother rejects: CTEs, OUTER APPLY, CROSS APPLY, and complex nested subqueries.
 * Strategy: 2 simple queries, merged in JS.
 */

/** 1. Base RDO + person info for a date */
export const quemFazBase = `
SELECT
  rdo.CODRDO,
  rdo.CODPARC,
  parc.NOMEPARC as nomeparc,
  usu.NOMEUSU as nomeusu,
  dep.DESCRDEP as departamento,
  car.DESCRCARGO as cargo
FROM AD_RDOAPONTAMENTOS rdo
LEFT JOIN TGFPAR parc ON rdo.CODPARC = parc.CODPARC
LEFT JOIN TSIUSU usu ON usu.CODPARC = rdo.CODPARC AND (usu.DTLIMACESSO IS NULL OR usu.DTLIMACESSO > GETDATE())
LEFT JOIN TFPFUN fun ON parc.CODPARC = fun.CODPARC AND fun.SITUACAO = '1'
LEFT JOIN TFPDEP dep ON fun.CODDEP = dep.CODDEP
LEFT JOIN TFPCAR car ON fun.CODCARGO = car.CODCARGO
WHERE rdo.DTREF = '@data'
ORDER BY rdo.CODRDO
`;

/** 2. All detalhes for the date — we pick last per CODRDO in JS */
export const quemFazDetalhes = `
SELECT
  d.CODRDO,
  d.ITEM,
  d.HRINI,
  d.HRFIM,
  d.RDOMOTIVOCOD,
  d.NUOS,
  d.AD_SEQUENCIA_OS,
  d.CODVEICULO as ultCodVeiculo,
  mot.SIGLA as ultMotivoSigla,
  mot.DESCRICAO as ultMotivoDesc,
  mot.PRODUTIVO as ultMotivoProdutivo,
  mot.WTCATEGORIA as ultMotivoCategoria,
  os.STATUS as ultOsStatus,
  os.TIPO as ultOsTipo,
  os.MANUTENCAO as ultOsManutencao,
  CASE WHEN v.PLACA IS NOT NULL THEN v.PLACA ELSE vd.PLACA END as ultOsPlaca,
  CASE WHEN v.MARCAMODELO IS NOT NULL THEN v.MARCAMODELO ELSE vd.MARCAMODELO END as ultOsModelo,
  CASE WHEN v.AD_TAG IS NOT NULL THEN v.AD_TAG ELSE vd.AD_TAG END as ultOsTag,
  CASE WHEN v.AD_TIPOEQPTO IS NOT NULL THEN v.AD_TIPOEQPTO ELSE vd.AD_TIPOEQPTO END as ultOsTipoEqpto,
  srv.CODPROD as ultSrvCodProd,
  prod.DESCRPROD as ultSrvNome,
  srv.STATUS as ultSrvStatus,
  srv.TEMPO as ultSrvTempo
FROM AD_RDOAPONDETALHES d
INNER JOIN AD_RDOAPONTAMENTOS r ON d.CODRDO = r.CODRDO
LEFT JOIN AD_RDOMOTIVOS mot ON d.RDOMOTIVOCOD = mot.RDOMOTIVOCOD
LEFT JOIN TCFOSCAB os ON d.NUOS = os.NUOS
LEFT JOIN TGFVEI v ON os.CODVEICULO = v.CODVEICULO
LEFT JOIN TGFVEI vd ON d.CODVEICULO = vd.CODVEICULO
LEFT JOIN TCFSERVOS srv ON d.NUOS = srv.NUOS AND d.AD_SEQUENCIA_OS = srv.SEQUENCIA
LEFT JOIN TGFPRO prod ON srv.CODPROD = prod.CODPROD
WHERE r.DTREF = '@data'
ORDER BY d.CODRDO, d.HRINI DESC
`;

/** 3. OS ativas count per CODPARC — lightweight, cached */
export const quemFazOsAtivas = `
SELECT osc.CODPARC, COUNT(*) as osAtivasCount
FROM TCFOSCAB osc
WHERE osc.STATUS IN ('A','E')
  AND osc.CODPARC IS NOT NULL
GROUP BY osc.CODPARC
`;

// Keep the old name for backwards compatibility in the index
export const quemFazSnapshot = quemFazBase;
