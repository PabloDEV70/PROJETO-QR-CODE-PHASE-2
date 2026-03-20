/**
 * Performance servico x executor
 * Dado um CODPROD (servico), retorna todos executores que o realizaram
 * Fonte: AD_TCFEXEC + TCFSERVOS + TSIUSU + TFPFUN + TFPCAR + TSICUS
 * Filtros: fim > inicio, DTINI > 2022, duracao <= 30 dias
 * Placeholders: @CODPROD (obrigatorio), -- @WHERE (periodo opcional)
 * SITUACAO: derivado de TSIUSU.DTLIMACESSO (0=Ativo, 1=Desligado/bloqueado)
 * Executor: COALESCE(CODUSUEXEC, CODUSU) — CODUSUEXEC e raro (2.3%), CODUSU e o fallback
 */

export const performanceServicoExecutor = `
SELECT
  COALESCE(ex.CODUSUEXEC, ex.CODUSU) AS codusu,
  uexec.NOMEUSU AS nomeUsuario,
  RTRIM(par.NOMEPARC) AS nomeColaborador,
  uexec.CODPARC AS codparc,
  fun.CODEMP AS codemp,
  fun.CODFUNC AS codfunc,
  CASE
    WHEN uexec.DTLIMACESSO IS NOT NULL AND uexec.DTLIMACESSO < GETDATE() THEN '1'
    ELSE '0'
  END AS situacao,
  car.DESCRCARGO AS cargo,
  cus.DESCRCENCUS AS departamento,
  COUNT(*) AS totalExecucoes,
  AVG(CAST(DATEDIFF(MINUTE, ex.DTINI, ex.DTFIN) AS FLOAT)) AS mediaMinutos,
  MIN(CAST(DATEDIFF(MINUTE, ex.DTINI, ex.DTFIN) AS FLOAT)) AS minMinutos,
  MAX(CAST(DATEDIFF(MINUTE, ex.DTINI, ex.DTFIN) AS FLOAT)) AS maxMinutos,
  SUM(DATEDIFF(MINUTE, ex.DTINI, ex.DTFIN)) AS totalMinutos,
  CONVERT(VARCHAR(10), MIN(ex.DTINI), 120) AS primeiraExec,
  CONVERT(VARCHAR(10), MAX(ex.DTFIN), 120) AS ultimaExec
FROM AD_TCFEXEC ex
INNER JOIN TCFSERVOS s ON ex.NUOS = s.NUOS AND ex.SEQUENCIA = s.SEQUENCIA
INNER JOIN TCFOSCAB O ON O.NUOS = ex.NUOS
LEFT JOIN TSIUSU uexec ON COALESCE(ex.CODUSUEXEC, ex.CODUSU) = uexec.CODUSU
LEFT JOIN TGFPAR par ON uexec.CODPARC = par.CODPARC
LEFT JOIN TFPFUN fun ON uexec.CODPARC = fun.CODPARC AND fun.CODEMP = uexec.CODEMP
LEFT JOIN TFPCAR car ON fun.CODCARGO = car.CODCARGO
LEFT JOIN TSICUS cus ON uexec.CODCENCUSPAD = cus.CODCENCUS
WHERE s.CODPROD = @CODPROD
  AND COALESCE(ex.CODUSUEXEC, ex.CODUSU) IS NOT NULL
  AND ex.DTFIN IS NOT NULL
  AND ex.DTINI IS NOT NULL
  AND ex.DTFIN > ex.DTINI
  AND ex.DTINI > '2022-01-01'
  AND DATEDIFF(DAY, ex.DTINI, ex.DTFIN) <= 30
-- @WHERE
GROUP BY COALESCE(ex.CODUSUEXEC, ex.CODUSU), uexec.NOMEUSU, par.NOMEPARC, uexec.CODPARC,
  fun.CODEMP, fun.CODFUNC, uexec.DTLIMACESSO,
  car.DESCRCARGO, cus.DESCRCENCUS, uexec.CODCENCUSPAD
ORDER BY totalExecucoes DESC
`;

/** Resumo do servico selecionado (KPI) */
export const performanceServicoResumo = `
SELECT
  COUNT(DISTINCT COALESCE(ex.CODUSUEXEC, ex.CODUSU)) AS totalExecutores,
  COUNT(*) AS totalExecucoes,
  AVG(CAST(DATEDIFF(MINUTE, ex.DTINI, ex.DTFIN) AS FLOAT)) AS mediaMinutos,
  MIN(CAST(DATEDIFF(MINUTE, ex.DTINI, ex.DTFIN) AS FLOAT)) AS minMinutos,
  MAX(CAST(DATEDIFF(MINUTE, ex.DTINI, ex.DTFIN) AS FLOAT)) AS maxMinutos,
  SUM(DATEDIFF(MINUTE, ex.DTINI, ex.DTFIN)) AS totalMinutos
FROM AD_TCFEXEC ex
INNER JOIN TCFSERVOS s ON ex.NUOS = s.NUOS AND ex.SEQUENCIA = s.SEQUENCIA
INNER JOIN TCFOSCAB O ON O.NUOS = ex.NUOS
WHERE s.CODPROD = @CODPROD
  AND COALESCE(ex.CODUSUEXEC, ex.CODUSU) IS NOT NULL
  AND ex.DTFIN IS NOT NULL
  AND ex.DTINI IS NOT NULL
  AND ex.DTFIN > ex.DTINI
  AND ex.DTINI > '2022-01-01'
  AND DATEDIFF(DAY, ex.DTINI, ex.DTFIN) <= 30
-- @WHERE
`;

/** Execucoes individuais (1 linha por execucao) */
export const performanceServicoExecucoes = `
SELECT
  ex.NUOS AS nuos,
  ex.SEQUENCIA AS sequencia,
  COALESCE(ex.CODUSUEXEC, ex.CODUSU) AS codusu,
  uexec.NOMEUSU AS nomeUsuario,
  RTRIM(par.NOMEPARC) AS nomeColaborador,
  uexec.CODPARC AS codparc,
  CONVERT(VARCHAR(19), ex.DTINI, 120) AS dtIni,
  CONVERT(VARCHAR(19), ex.DTFIN, 120) AS dtFin,
  DATEDIFF(MINUTE, ex.DTINI, ex.DTFIN) AS minutos,
  O.STATUS AS statusOs,
  CASE O.STATUS
    WHEN 'A' THEN 'Aberta'
    WHEN 'E' THEN 'Execucao'
    WHEN 'F' THEN 'Finalizada'
    WHEN 'C' THEN 'Cancelada'
    ELSE O.STATUS
  END AS statusOsLabel,
  v.PLACA AS placa,
  v.MARCAMODELO AS marcaModelo,
  CAST(ex.OBS AS VARCHAR(500)) AS observacao
FROM AD_TCFEXEC ex
INNER JOIN TCFSERVOS s ON ex.NUOS = s.NUOS AND ex.SEQUENCIA = s.SEQUENCIA
INNER JOIN TCFOSCAB O ON O.NUOS = ex.NUOS
LEFT JOIN TGFVEI v ON O.CODVEICULO = v.CODVEICULO
LEFT JOIN TSIUSU uexec ON COALESCE(ex.CODUSUEXEC, ex.CODUSU) = uexec.CODUSU
LEFT JOIN TGFPAR par ON uexec.CODPARC = par.CODPARC
WHERE s.CODPROD = @CODPROD
  AND ex.DTFIN IS NOT NULL
  AND ex.DTINI IS NOT NULL
  AND ex.DTFIN > ex.DTINI
  AND ex.DTINI > '2022-01-01'
  AND DATEDIFF(DAY, ex.DTINI, ex.DTFIN) <= 30
-- @WHERE
ORDER BY ex.DTFIN DESC
`;

/** Arvore de grupos com contagem de servicos */
export const gruposArvore = `
SELECT
  g.CODGRUPOPROD AS codGrupo,
  g.DESCRGRUPOPROD AS descricao,
  g.CODGRUPAI AS codGrupoPai,
  g.GRAU AS grau,
  COUNT(p.CODPROD) AS qtdServicos
FROM TGFGRU g
LEFT JOIN TGFPRO p ON p.CODGRUPOPROD = g.CODGRUPOPROD AND p.USOPROD = 'S'
WHERE g.ATIVO = 'S'
GROUP BY g.CODGRUPOPROD, g.DESCRGRUPOPROD, g.CODGRUPAI, g.GRAU
ORDER BY g.GRAU, g.DESCRGRUPOPROD
`;

/** Servicos de um grupo */
export const servicosPorGrupo = `
SELECT
  p.CODPROD AS codProd,
  RTRIM(p.DESCRPROD) AS descrProd,
  p.CODGRUPOPROD AS codGrupo
FROM TGFPRO p
WHERE p.USOPROD = 'S'
  AND p.CODGRUPOPROD = @CODGRUPO
ORDER BY p.DESCRPROD
`;
