/**
 * Servicos que possuem execucoes validas em AD_TCFEXEC
 * Retorna flat list com contagem, grupo (+ pai e grau), e media de tempo
 * Filtros de sanidade: fim > inicio, DTINI > 2022, duracao <= 30 dias
 * Executor: COALESCE(CODUSUEXEC, CODUSU) — inclui registros sem executor especifico
 */

export const servicosComExecucao = `
SELECT
  s.CODPROD AS codProd,
  RTRIM(pro.DESCRPROD) AS descrProd,
  pro.CODGRUPOPROD AS codGrupo,
  RTRIM(g.DESCRGRUPOPROD) AS descrGrupo,
  g.CODGRUPAI AS codGrupoPai,
  g.GRAU AS grauGrupo,
  RTRIM(gpai.DESCRGRUPOPROD) AS descrGrupoPai,
  COUNT(*) AS totalExecucoes,
  COUNT(DISTINCT COALESCE(ex.CODUSUEXEC, ex.CODUSU)) AS totalExecutores,
  AVG(CAST(DATEDIFF(MINUTE, ex.DTINI, ex.DTFIN) AS FLOAT)) AS mediaMinutos
FROM AD_TCFEXEC ex
INNER JOIN TCFSERVOS s ON ex.NUOS = s.NUOS AND ex.SEQUENCIA = s.SEQUENCIA
INNER JOIN TGFPRO pro ON s.CODPROD = pro.CODPROD
LEFT JOIN TGFGRU g ON pro.CODGRUPOPROD = g.CODGRUPOPROD
LEFT JOIN TGFGRU gpai ON g.CODGRUPAI = gpai.CODGRUPOPROD
WHERE ex.DTFIN IS NOT NULL
  AND ex.DTINI IS NOT NULL
  AND ex.DTFIN > ex.DTINI
  AND ex.DTINI > '2022-01-01'
  AND DATEDIFF(DAY, ex.DTINI, ex.DTFIN) <= 30
  AND pro.USOPROD = 'S'
GROUP BY s.CODPROD, pro.DESCRPROD, pro.CODGRUPOPROD,
  g.DESCRGRUPOPROD, g.CODGRUPAI, g.GRAU, gpai.DESCRGRUPOPROD
ORDER BY totalExecucoes DESC
`;
