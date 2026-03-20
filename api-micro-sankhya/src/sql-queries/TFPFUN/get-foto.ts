/**
 * Busca a foto/imagem do funcionário pelo CODPARC
 * Retorna o campo IMAGEM (blob) da tabela TFPFUN
 * Sem filtro de SITUACAO: foto existe para qualquer status (ativo, demitido, afastado)
 */
export const getFotoPorCodparc = `
SELECT TOP 1
  fun.CODPARC,
  fun.CODEMP,
  fun.CODFUNC,
  fun.IMAGEM
FROM TFPFUN fun
WHERE fun.CODPARC = @codparc
  AND fun.IMAGEM IS NOT NULL
`;

/**
 * Busca a foto/imagem do funcionário por CODEMP+CODFUNC
 * Usado quando o funcionário não tem CODPARC (TGFPAR) vinculado
 * Sem filtro de SITUACAO: foto existe para qualquer status
 */
export const getFotoPorCodfunc = `
SELECT TOP 1
  fun.CODPARC,
  fun.CODEMP,
  fun.CODFUNC,
  fun.IMAGEM
FROM TFPFUN fun
WHERE fun.CODEMP = @codemp
  AND fun.CODFUNC = @codfunc
  AND fun.IMAGEM IS NOT NULL
`;

/**
 * Verifica se o funcionário tem foto cadastrada
 * Retorna apenas metadados (sem o blob)
 */
export const temFoto = `
SELECT TOP 1
  fun.CODPARC,
  CASE WHEN fun.IMAGEM IS NOT NULL THEN 1 ELSE 0 END AS temFoto,
  DATALENGTH(fun.IMAGEM) AS tamanhoBytes
FROM TFPFUN fun
WHERE fun.CODPARC = @codparc
`;
