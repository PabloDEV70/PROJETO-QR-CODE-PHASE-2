/**
 * Busca ausencias (ferias + afastamentos) no periodo.
 * TFPFER: ferias aprovadas. TFPOCO+TFPHIS: atestados, licencas etc.
 * Exclui CODHISTOCOR=27 (ferias em TFPOCO) para evitar dupla contagem.
 * Inclui CODHISTOCOR=18 (atestado medico em dias) mesmo com REDUZDIASTRAB='N'.
 *
 * Params: @DataInicio, @DataFim
 */
export const getAusencias = `
SELECT
  fer.CODEMP,
  fer.CODFUNC,
  CONVERT(VARCHAR(10), fer.DTSAIDA, 120) AS dtInicio,
  fer.NUMDIASFER AS numDias,
  'FERIAS' AS tipo
FROM TFPFER fer
WHERE fer.APROVADO = 'S'
  AND DATEADD(day, fer.NUMDIASFER, fer.DTSAIDA) >= '@DataInicio'
  AND fer.DTSAIDA <= '@DataFim'

UNION ALL

SELECT
  oco.CODEMP,
  oco.CODFUNC,
  CONVERT(VARCHAR(10), oco.DTINICOCOR, 120) AS dtInicio,
  DATEDIFF(day, oco.DTINICOCOR,
    ISNULL(oco.DTFINALOCOR, '@DataFim')) + 1 AS numDias,
  'AFASTAMENTO' AS tipo
FROM TFPOCO oco
JOIN TFPHIS his ON oco.CODHISTOCOR = his.CODHISTOCOR
WHERE (his.REDUZDIASTRAB = 'S' OR oco.CODHISTOCOR = 18)
  AND oco.CODHISTOCOR != 27
  AND oco.DTINICOCOR <= '@DataFim'
  AND ISNULL(oco.DTFINALOCOR, '@DataFim') >= '@DataInicio'
`;
