/**
 * Busca funcionarios ativos com carga horaria atual (via TFPFHO).
 * CRITICAL: Usa TFPFHO com TOP 1 ORDER BY DTINIESCALA DESC,
 * pois TFPFUN.CODCARGAHOR e STALE.
 *
 * Params: @DataFim, -- @WHERE (optional: AND f.CODDEP = ...)
 */
export const getFuncionariosAtivos = `
SELECT
  f.CODEMP,
  f.CODFUNC,
  RTRIM(f.NOMEFUNC) AS NOMEFUNC,
  f.DTADM,
  f.CODPARC,
  f.CODDEP,
  (SELECT TOP 1 fho.CODCARGAHOR
   FROM TFPFHO fho
   WHERE fho.CODEMP = f.CODEMP
     AND fho.CODFUNC = f.CODFUNC
   ORDER BY fho.DTINIESCALA DESC) AS CODCARGAHOR
FROM TFPFUN f
WHERE f.SITUACAO = '1'
  AND f.DTADM <= '@DataFim'
-- @WHERE
`;
