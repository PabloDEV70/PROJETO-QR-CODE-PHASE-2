/**
 * Busca feriados no periodo (TSIFER).
 * Somente feriados marcados com USANOPONTO='S'.
 * Params: @DataInicio, @DataFim
 */
export const getFeriados = `
SELECT
  CONVERT(VARCHAR(10), fer.DTFERIADO, 120) AS dtFeriado,
  RTRIM(fer.DESCRFERIADO) AS descricao
FROM TSIFER fer
WHERE fer.DTFERIADO BETWEEN '@DataInicio' AND '@DataFim'
  AND fer.USANOPONTO = 'S'
`;
