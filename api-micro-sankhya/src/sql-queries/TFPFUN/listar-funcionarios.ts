/**
 * Lista funcionários com paginação (SQL Server 2005 compatible)
 * Usa ROW_NUMBER() para paginação
 * Filtros: situacao, codemp, coddep, codcargo, codfuncao, termo, comUsuario, temFoto
 * Ordenação: nomeparc (default), codparc, cargo, departamento, dtadm
 */

/**
 * Query principal - retorna dados paginados
 * Placeholders: @offset, @limit, @whereClause, @orderBy
 */
export const listarFuncionarios = `
SELECT * FROM (
  SELECT
    par.CODPARC AS codparc,
    par.NOMEPARC AS nomeparc,
    par.CGC_CPF AS cgcCpf,
    par.CLIENTE AS cliente,
    par.FORNECEDOR AS fornecedor,
    fun.CODFUNC AS codfunc,
    fun.CODEMP AS codemp,
    fun.SITUACAO AS situacao,
    CONVERT(VARCHAR(10), fun.DTADM, 120) AS dtadm,
    CONVERT(VARCHAR(10), fun.DTNASC, 120) AS dtnasc,
    CASE WHEN fun.DTNASC IS NOT NULL THEN
      DATEDIFF(YEAR, fun.DTNASC, GETDATE())
      - CASE
          WHEN MONTH(fun.DTNASC) > MONTH(GETDATE())
            OR (MONTH(fun.DTNASC) = MONTH(GETDATE())
                AND DAY(fun.DTNASC) > DAY(GETDATE()))
          THEN 1 ELSE 0
        END
    ELSE NULL END AS idade,
    DATEDIFF(DAY, fun.DTADM, GETDATE()) AS diasNaEmpresa,
    car.DESCRCARGO AS cargo,
    fun.CODDEP AS coddep,
    dep.DESCRDEP AS departamento,
    emp.NOMEFANTASIA AS empresa,
    CASE WHEN fun.IMAGEM IS NOT NULL THEN 1 ELSE 0 END AS temFoto,
    CASE WHEN EXISTS (
      SELECT 1 FROM TSIUSU u2
      WHERE u2.CODPARC = par.CODPARC
        AND (u2.DTLIMACESSO IS NULL OR u2.DTLIMACESSO > GETDATE())
    ) THEN 1 ELSE 0 END AS temUsuario,
    CASE WHEN EXISTS (
      SELECT 1 FROM AD_ARMARIO arm
      WHERE arm.CODEMP = fun.CODEMP AND arm.CODFUNC = fun.CODFUNC
    ) THEN 1 ELSE 0 END AS temArmario,
    CONVERT(VARCHAR(10), fun.DTAFASTAMENTO, 120) AS dtAfastamento,
    fun.CAUSAAFAST AS causaAfastamento,
    (SELECT TOP 1 CONVERT(VARCHAR(10), fer.DTSAIDA, 120) FROM TFPFER fer
     WHERE fer.CODFUNC = fun.CODFUNC AND fer.CODEMP = fun.CODEMP
     AND fer.DTSAIDA IS NOT NULL
     ORDER BY fer.DTSAIDA DESC) AS feriasInicio,
    (SELECT TOP 1 fer.NUMDIASFER FROM TFPFER fer
     WHERE fer.CODFUNC = fun.CODFUNC AND fer.CODEMP = fun.CODEMP
     AND fer.DTSAIDA IS NOT NULL
     ORDER BY fer.DTSAIDA DESC) AS feriasDias,
    ROW_NUMBER() OVER (ORDER BY @orderBy) AS RowNum
  FROM TGFPAR par
  INNER JOIN TFPFUN fun ON fun.CODPARC = par.CODPARC
    AND CAST(fun.CODEMP AS VARCHAR) + '-' + CAST(fun.CODFUNC AS VARCHAR) = (
      SELECT TOP 1 CAST(f2.CODEMP AS VARCHAR) + '-' + CAST(f2.CODFUNC AS VARCHAR)
      FROM TFPFUN f2
      WHERE f2.CODPARC = par.CODPARC AND f2.SITUACAO = fun.SITUACAO
      ORDER BY f2.DTADM DESC, f2.CODEMP DESC
    )
  LEFT JOIN TFPCAR car ON car.CODCARGO = fun.CODCARGO
  LEFT JOIN TFPDEP dep ON dep.CODDEP = fun.CODDEP
  LEFT JOIN TSIEMP emp ON emp.CODEMP = fun.CODEMP
  WHERE par.CODPARC > 0 @whereClause
) AS T
WHERE RowNum > @offset AND RowNum <= (@offset + @limit)
`;

/**
 * Query de contagem total para paginação
 * Placeholder: @whereClause
 */
export const contarFuncionarios = `
SELECT COUNT(*) AS total
FROM TGFPAR par
INNER JOIN TFPFUN fun ON fun.CODPARC = par.CODPARC
WHERE par.CODPARC > 0 @whereClause
`;

/**
 * Query de resumo para dashboard
 * Retorna totais por situação
 */
export const resumoFuncionarios = `
SELECT
  SUM(CASE WHEN fun.SITUACAO = '1' THEN 1 ELSE 0 END) AS totalAtivos,
  SUM(CASE WHEN fun.SITUACAO = '0' THEN 1 ELSE 0 END) AS totalDemitidos,
  SUM(CASE WHEN fun.SITUACAO IN ('2','3','4','5','6','9') THEN 1 ELSE 0 END) AS totalAfastados,
  SUM(CASE WHEN fun.SITUACAO = '8' THEN 1 ELSE 0 END) AS totalTransferidos,
  SUM(CASE WHEN fun.IMAGEM IS NOT NULL THEN 1 ELSE 0 END) AS totalComFoto,
  COUNT(*) AS total
FROM TFPFUN fun
INNER JOIN TGFPAR par ON par.CODPARC = fun.CODPARC
WHERE par.CODPARC > 0
`;

export const contarUsuariosFuncionarios = `
SELECT COUNT(*) AS totalComUsuario
FROM TSIUSU u
INNER JOIN TFPFUN fun ON fun.CODPARC = u.CODPARC
INNER JOIN TGFPAR par ON par.CODPARC = fun.CODPARC
WHERE par.CODPARC > 0
  AND (u.DTLIMACESSO IS NULL OR u.DTLIMACESSO > GETDATE())
`;

/**
 * Query de totais por empresa
 */
export const totaisPorEmpresa = `
SELECT
  fun.CODEMP AS codemp,
  emp.NOMEFANTASIA AS nome,
  COUNT(*) AS total
FROM TFPFUN fun
INNER JOIN TGFPAR par ON par.CODPARC = fun.CODPARC
LEFT JOIN TSIEMP emp ON emp.CODEMP = fun.CODEMP
WHERE fun.SITUACAO = '1' AND par.CODPARC > 0
GROUP BY fun.CODEMP, emp.NOMEFANTASIA
ORDER BY total DESC
`;

/**
 * Query de totais por departamento
 */
export const totaisPorDepartamento = `
SELECT TOP 10
  fun.CODDEP AS coddep,
  dep.DESCRCENCUS AS nome,
  COUNT(*) AS total
FROM TFPFUN fun
INNER JOIN TGFPAR par ON par.CODPARC = fun.CODPARC
LEFT JOIN TSICUS dep ON dep.CODCENCUS = fun.CODDEP
WHERE fun.SITUACAO = '1' AND par.CODPARC > 0 AND fun.CODDEP IS NOT NULL
GROUP BY fun.CODDEP, dep.DESCRCENCUS
ORDER BY total DESC
`;
