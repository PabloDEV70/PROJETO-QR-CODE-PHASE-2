import { TAG_PREFIX_CASE, LOCAL_OPC_JOIN, LOCAL_DESCRICAO_COL } from './sql-fragments';

/**
 * Lista armarios com paginacao (SQL Server 2005 compatible)
 * Usa ROW_NUMBER() para paginacao
 * Usa OUTER APPLY para TFPFUN (evita duplicatas por transferencia/readmissao)
 * Usa JOIN TDDOPC para descricao do local (data dictionary)
 * Filtros: localArm, ocupado, termo
 * Ordenacao: nuarmario (default), localDescricao, nomeFuncionario, tagArmario
 */

/**
 * Query principal - retorna dados paginados
 * Placeholders: @offset, @limit, @whereClause, @orderBy
 */
export const listarArmarios = `
SELECT * FROM (
  SELECT
    a.CODARMARIO AS codarmario,
    a.NUARMARIO AS nuarmario,
    a.LOCAL_ARM AS localArm,
    ${TAG_PREFIX_CASE} + '-' + RIGHT('000' + CAST(a.NUARMARIO AS VARCHAR), 3) AS tagArmario,
    ${LOCAL_DESCRICAO_COL} AS localDescricao,
    RTRIM(CAST(ISNULL(a.NUCADEADO, '') AS VARCHAR(MAX))) AS nucadeado,
    a.CODEMP AS codemp,
    ISNULL(a.CODFUNC, 0) AS codfunc,
    CASE WHEN a.CODFUNC IS NOT NULL AND a.CODFUNC > 0 THEN 1 ELSE 0 END AS ocupado,
    ISNULL(fun.CODPARC, 0) AS codparc,
    ISNULL(RTRIM(CAST(fun.NOMEPARC AS VARCHAR(MAX))), '') AS nomeFuncionario,
    ISNULL(RTRIM(CAST(fun.DESCRCARGO AS VARCHAR(MAX))), '') AS cargo,
    ISNULL(RTRIM(CAST(fun.DESCRDEP AS VARCHAR(MAX))), '') AS departamento,
    ISNULL(RTRIM(CAST(fun.DESCRFUNCAO AS VARCHAR(MAX))), '') AS funcao,
    ISNULL(RTRIM(CAST(emp.NOMEFANTASIA AS VARCHAR(MAX))), '') AS empresa,
    ROW_NUMBER() OVER (ORDER BY @orderBy) AS RowNum
  FROM AD_ARMARIO a
  ${LOCAL_OPC_JOIN}
  OUTER APPLY (
    SELECT TOP 1
      p.NOMEPARC,
      car.DESCRCARGO,
      f.CODPARC,
      dep.DESCRDEP,
      fnc.DESCRFUNCAO
    FROM TFPFUN f
    INNER JOIN TGFPAR p ON p.CODPARC = f.CODPARC
    LEFT JOIN TFPCAR car ON car.CODCARGO = f.CODCARGO
    LEFT JOIN TFPDEP dep ON dep.CODDEP = f.CODDEP
    LEFT JOIN TFPFCO fnc ON fnc.CODFUNCAO = f.CODFUNCAO
    WHERE f.CODEMP = a.CODEMP AND f.CODFUNC = a.CODFUNC
    ORDER BY f.DTADM DESC
  ) fun
  LEFT JOIN TSIEMP emp ON emp.CODEMP = a.CODEMP
  WHERE 1=1 @whereClause
) AS T
WHERE RowNum > @offset AND RowNum <= (@offset + @limit)
`;

/**
 * Query de contagem total para paginacao
 * Placeholder: @whereClause
 */
export const contarArmarios = `
SELECT COUNT(*) AS total
FROM AD_ARMARIO a
OUTER APPLY (
  SELECT TOP 1 p.NOMEPARC, dep.DESCRDEP
  FROM TFPFUN f
  INNER JOIN TGFPAR p ON p.CODPARC = f.CODPARC
  LEFT JOIN TFPDEP dep ON dep.CODDEP = f.CODDEP
  WHERE f.CODEMP = a.CODEMP AND f.CODFUNC = a.CODFUNC
  ORDER BY f.DTADM DESC
) fun
WHERE 1=1 @whereClause
`;

/**
 * Lista TODOS armarios sem paginacao (com TOP 500 safety cap)
 * Usado para impressao em lote de todos os filtrados
 * Placeholders: @whereClause, @orderBy
 */
export const listarArmariosTodos = `
SELECT TOP 500
  a.CODARMARIO AS codarmario,
  a.NUARMARIO AS nuarmario,
  a.LOCAL_ARM AS localArm,
  ${TAG_PREFIX_CASE} + '-' + RIGHT('000' + CAST(a.NUARMARIO AS VARCHAR), 3) AS tagArmario,
  ${LOCAL_DESCRICAO_COL} AS localDescricao,
  RTRIM(CAST(ISNULL(a.NUCADEADO, '') AS VARCHAR(MAX))) AS nucadeado,
  a.CODEMP AS codemp,
  ISNULL(a.CODFUNC, 0) AS codfunc,
  CASE WHEN a.CODFUNC IS NOT NULL AND a.CODFUNC > 0 THEN 1 ELSE 0 END AS ocupado,
  ISNULL(fun.CODPARC, 0) AS codparc,
  ISNULL(RTRIM(CAST(fun.NOMEPARC AS VARCHAR(MAX))), '') AS nomeFuncionario,
  ISNULL(RTRIM(CAST(fun.DESCRCARGO AS VARCHAR(MAX))), '') AS cargo,
  ISNULL(RTRIM(CAST(fun.DESCRDEP AS VARCHAR(MAX))), '') AS departamento,
  ISNULL(RTRIM(CAST(fun.DESCRFUNCAO AS VARCHAR(MAX))), '') AS funcao,
  ISNULL(RTRIM(CAST(emp.NOMEFANTASIA AS VARCHAR(MAX))), '') AS empresa
FROM AD_ARMARIO a
${LOCAL_OPC_JOIN}
OUTER APPLY (
  SELECT TOP 1
    p.NOMEPARC,
    car.DESCRCARGO,
    f.CODPARC,
    dep.DESCRDEP,
    fnc.DESCRFUNCAO
  FROM TFPFUN f
  INNER JOIN TGFPAR p ON p.CODPARC = f.CODPARC
  LEFT JOIN TFPCAR car ON car.CODCARGO = f.CODCARGO
  LEFT JOIN TFPDEP dep ON dep.CODDEP = f.CODDEP
  LEFT JOIN TFPFCO fnc ON fnc.CODFUNCAO = f.CODFUNCAO
  WHERE f.CODEMP = a.CODEMP AND f.CODFUNC = a.CODFUNC
  ORDER BY f.DTADM DESC
) fun
LEFT JOIN TSIEMP emp ON emp.CODEMP = a.CODEMP
WHERE 1=1 @whereClause
ORDER BY @orderBy
`;
