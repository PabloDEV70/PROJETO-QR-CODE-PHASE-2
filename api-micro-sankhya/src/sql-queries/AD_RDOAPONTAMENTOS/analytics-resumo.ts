export const analyticsResumo = `
SELECT
  COUNT(DISTINCT rdo.CODRDO) as totalRdos,
  COUNT(det.ITEM) as totalDetalhes,
  COUNT(DISTINCT rdo.CODPARC) as totalColaboradores,
  CAST(ISNULL(SUM(CASE WHEN det.HRFIM > det.HRINI AND det.HRFIM <= 2400 THEN
    ((det.HRFIM / 100) * 60 + (det.HRFIM % 100)) -
    ((det.HRINI / 100) * 60 + (det.HRINI % 100))
  ELSE 0 END) / 60.0, 0) AS DECIMAL(10,2)) as totalHoras,
  COUNT(DISTINCT rdo.DTREF) as diasComDados,
  CAST(ISNULL(SUM(CASE WHEN det.HRFIM > det.HRINI AND det.HRFIM <= 2400 THEN
    ((det.HRFIM / 100) * 60 + (det.HRFIM % 100)) -
    ((det.HRINI / 100) * 60 + (det.HRINI % 100))
  ELSE 0 END) / 60.0 / NULLIF(COUNT(DISTINCT rdo.DTREF), 0), 0)
  AS DECIMAL(10,2)) as mediaHorasDia,
  CAST(COUNT(det.ITEM) * 1.0
    / NULLIF(COUNT(DISTINCT rdo.CODRDO), 0) AS DECIMAL(10,2)) as mediaItensPorRdo,
  CAST(SUM(CASE WHEN det.NUOS IS NOT NULL THEN 1 ELSE 0 END) * 100.0
    / NULLIF(COUNT(det.ITEM), 0) AS DECIMAL(10,2)) as percentualComOs
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
`;

/**
 * Total de minutos previstos (jornada) para todos os RDOs do periodo.
 * Cruza TFPFHO (carga horaria atual) com TFPHOR (pre-agregado por dia da semana).
 * Opera no nivel RDO (1 RDO = 1 colaborador x 1 dia).
 * Executado como query separada — aliases rdo/parc/fun compativeis com buildWhere().
 */
export const analyticsResumoJornada = `
SELECT
  ISNULL(SUM(ISNULL(hor.minutosDia, 0)), 0) as totalMinutosPrevistos
FROM AD_RDOAPONTAMENTOS rdo
LEFT JOIN TGFPAR parc ON rdo.CODPARC = parc.CODPARC
LEFT JOIN (
  SELECT f2.CODPARC, f2.CODDEP, f2.CODCARGO, f2.CODFUNCAO, f2.CODEMP,
    (SELECT TOP 1 fho.CODCARGAHOR FROM TFPFHO fho
     WHERE fho.CODEMP = f2.CODEMP AND fho.CODFUNC = f2.CODFUNC
     ORDER BY fho.DTINIESCALA DESC) AS CODCARGAHOR,
    ROW_NUMBER() OVER (PARTITION BY f2.CODPARC ORDER BY f2.DTADM DESC) as rn
  FROM TFPFUN f2 WHERE f2.SITUACAO = '1'
) fun ON parc.CODPARC = fun.CODPARC AND fun.rn = 1
LEFT JOIN (
  SELECT CODCARGAHOR, DIASEM,
    SUM(CASE WHEN ENTRADA IS NOT NULL AND SAIDA IS NOT NULL THEN
      ((SAIDA / 100) * 60 + (SAIDA % 100)) -
      ((ENTRADA / 100) * 60 + (ENTRADA % 100))
    ELSE 0 END) as minutosDia
  FROM TFPHOR
  GROUP BY CODCARGAHOR, DIASEM
) hor ON hor.CODCARGAHOR = fun.CODCARGAHOR
  AND hor.DIASEM = DATEPART(WEEKDAY, rdo.DTREF)
WHERE 1=1
-- @WHERE
`;

export const analyticsResumoTopMotivo = `
SELECT TOP 1
  mot.DESCRICAO as topMotivo,
  mot.SIGLA as topMotivoSigla,
  CAST(ISNULL(SUM(CASE WHEN det.HRFIM > det.HRINI AND det.HRFIM <= 2400 THEN
    ((det.HRFIM / 100) * 60 + (det.HRFIM % 100)) -
    ((det.HRINI / 100) * 60 + (det.HRINI % 100))
  ELSE 0 END) / 60.0, 0) AS DECIMAL(10,2)) as horasMotivo
FROM AD_RDOAPONDETALHES det
INNER JOIN AD_RDOAPONTAMENTOS rdo ON det.CODRDO = rdo.CODRDO
LEFT JOIN AD_RDOMOTIVOS mot ON det.RDOMOTIVOCOD = mot.RDOMOTIVOCOD
LEFT JOIN TGFPAR parc ON rdo.CODPARC = parc.CODPARC
LEFT JOIN (
  SELECT CODPARC, CODDEP, CODCARGO, CODFUNCAO, CODEMP,
    ROW_NUMBER() OVER (PARTITION BY CODPARC ORDER BY DTADM DESC) as rn
  FROM TFPFUN WHERE SITUACAO = '1'
) fun ON parc.CODPARC = fun.CODPARC AND fun.rn = 1
WHERE 1=1
-- @WHERE
GROUP BY mot.RDOMOTIVOCOD, mot.DESCRICAO, mot.SIGLA
ORDER BY horasMotivo DESC
`;
