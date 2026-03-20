import { TAG_PREFIX_CASE, LOCAL_OPC_JOIN, LOCAL_DESCRICAO_COL } from './sql-fragments';

export const getPublico = `
SELECT TOP 1
  a.CODARMARIO AS codarmario,
  a.NUARMARIO AS nuarmario,
  a.LOCAL_ARM AS localArm,
  ${TAG_PREFIX_CASE} + '-' + RIGHT('000' + CAST(a.NUARMARIO AS VARCHAR), 3) AS tagArmario,
  ${LOCAL_DESCRICAO_COL} AS localDescricao,
  CASE WHEN a.CODFUNC IS NOT NULL AND a.CODFUNC > 0 THEN 1 ELSE 0 END AS ocupado,
  ISNULL(fun.nomeFuncionario, '') AS nomeFuncionario,
  ISNULL(fun.departamento, '') AS departamento,
  ISNULL(RTRIM(CAST(emp.NOMEFANTASIA AS VARCHAR(MAX))), '') AS empresa,
  ISNULL(fun.codparc, 0) AS _codparcInterno
FROM AD_ARMARIO a
${LOCAL_OPC_JOIN}
OUTER APPLY (
  SELECT TOP 1
    f.CODPARC AS codparc,
    RTRIM(CAST(p.NOMEPARC AS VARCHAR(MAX))) AS nomeFuncionario,
    RTRIM(CAST(ISNULL(dep.DESCRDEP, '') AS VARCHAR(100))) AS departamento
  FROM TFPFUN f
  INNER JOIN TGFPAR p ON p.CODPARC = f.CODPARC
  LEFT JOIN TFPDEP dep ON dep.CODDEP = f.CODDEP
  WHERE f.CODEMP = a.CODEMP AND f.CODFUNC = a.CODFUNC
  ORDER BY f.DTADM DESC
) fun
LEFT JOIN TSIEMP emp ON emp.CODEMP = a.CODEMP
WHERE a.CODARMARIO = @CODARMARIO
`;
