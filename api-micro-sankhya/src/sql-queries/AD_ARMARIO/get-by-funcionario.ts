import { TAG_PREFIX_CASE, LOCAL_OPC_JOIN, LOCAL_DESCRICAO_COL } from './sql-fragments';

export const getByFuncionario = `
SELECT TOP 1
  a.CODARMARIO AS codarmario,
  a.CODEMP AS codemp,
  a.CODFUNC AS codfunc,
  a.LOCAL_ARM AS localArm,
  a.NUARMARIO AS nuarmario,
  RTRIM(CAST(ISNULL(a.NUCADEADO, '') AS VARCHAR(MAX))) AS nucadeado,
  ${TAG_PREFIX_CASE} + '-' + RIGHT('000' + CAST(a.NUARMARIO AS VARCHAR), 3) AS tagArmario,
  ${LOCAL_DESCRICAO_COL} AS localDescricao
FROM AD_ARMARIO a
${LOCAL_OPC_JOIN}
WHERE a.CODEMP = @CODEMP AND a.CODFUNC = @CODFUNC
`;
