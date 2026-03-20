/**
 * Busca dados publicos do funcionario para card de identificacao
 * NAO inclui dados sensiveis (CPF, salario, email, telefone)
 */
export const getCardPublico = `
SELECT TOP 1
  f.CODEMP,
  f.CODFUNC,
  f.SITUACAO,
  f.DTADM,
  COALESCE(p.NOMEPARC, f.NOMEFUNC) AS NOME,
  car.DESCRCARGO AS CARGO,
  fnc.DESCRFUNCAO AS FUNCAO,
  dep.DESCRCENCUS AS DEPARTAMENTO,
  emp.NOMEFANTASIA AS EMPRESA
FROM TFPFUN f
LEFT JOIN TGFPAR p ON p.CODPARC = f.CODPARC
LEFT JOIN TFPCAR car ON car.CODCARGO = f.CODCARGO
LEFT JOIN TFPFCO fnc ON fnc.CODFUNCAO = f.CODFUNCAO
LEFT JOIN TSICUS dep ON dep.CODCENCUS = f.CODCENCUS
LEFT JOIN TSIEMP emp ON emp.CODEMP = f.CODEMP
WHERE f.CODEMP = @codemp AND f.CODFUNC = @codfunc
`;
