/**
 * Queries para popular dropdowns de filtros na tela de listagem
 */

export const opcoesEmpresas = `
SELECT DISTINCT
  emp.CODEMP AS codigo,
  emp.NOMEFANTASIA AS nome
FROM TSIEMP emp
INNER JOIN TFPFUN fun ON fun.CODEMP = emp.CODEMP
ORDER BY emp.NOMEFANTASIA
`;

export const opcoesDepartamentos = `
SELECT
  dep.CODDEP AS codigo,
  RTRIM(dep.DESCRDEP) AS nome
FROM TFPDEP dep
WHERE dep.ATIVO = 'S' AND dep.CODDEP > 0
ORDER BY dep.DESCRDEP
`;

export const opcoesCargos = `
SELECT DISTINCT
  fun.CODCARGO AS codigo,
  car.DESCRCARGO AS nome
FROM TFPFUN fun
INNER JOIN TFPCAR car ON car.CODCARGO = fun.CODCARGO
WHERE fun.CODCARGO IS NOT NULL
ORDER BY car.DESCRCARGO
`;

export const opcoesFuncoes = `
SELECT DISTINCT
  fun.CODFUNCAO AS codigo,
  fco.DESCRFUNCAO AS nome
FROM TFPFUN fun
INNER JOIN TFPFCO fco ON fco.CODFUNCAO = fun.CODFUNCAO
WHERE fun.CODFUNCAO IS NOT NULL
ORDER BY fco.DESCRFUNCAO
`;

export const opcoesCentrosResultado = `
SELECT DISTINCT
  c.CODCENCUS AS codigo,
  c.DESCRCENCUS AS nome
FROM TSICUS c
WHERE c.ATIVO = 'S' AND c.CODCENCUS > 0
ORDER BY c.DESCRCENCUS
`;
