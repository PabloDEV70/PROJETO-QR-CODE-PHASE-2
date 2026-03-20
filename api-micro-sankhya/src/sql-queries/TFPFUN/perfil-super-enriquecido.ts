/**
 * Query para buscar dados de gestor e centro de resultado
 * Cadeia: TFPFUN -> TSIUSU -> TSICUS -> TSIUSU (gestor)
 */
export const gestorInfo = `
SELECT
  c.CODCENCUS AS codcencus,
  c.DESCRCENCUS AS centroResultado,
  g.CODUSU AS gestorCodusu,
  g.NOMEUSU AS gestorNome,
  g.EMAIL AS gestorEmail,
  gf.CELULAR AS gestorCelular,
  gc.DESCRCARGO AS gestorCargo,
  gd.DESCRDEP AS gestorDepartamento
FROM TSIUSU u
JOIN TSICUS c ON c.CODCENCUS = u.CODCENCUSPAD
LEFT JOIN TSIUSU g ON g.CODUSU = c.CODUSURESP
LEFT JOIN TFPFUN gf ON gf.CODEMP = g.CODEMP AND gf.CODFUNC = g.CODFUNC
LEFT JOIN TFPCAR gc ON gc.CODCARGO = gf.CODCARGO
LEFT JOIN TFPDEP gd ON gd.CODDEP = gf.CODDEP
WHERE u.CODPARC = @codparc
  AND u.CODUSU > 0
  AND c.CODCENCUS > 0
`;
