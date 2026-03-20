export const validarColaborador = `
SELECT TOP 1
  parceiros.CODPARC AS codparc,
  parceiros.NOMEPARC AS nomeparc,
  parceiros.CGC_CPF AS parceiro_cpf_raw,
  parceiros.RAZAOSOCIAL AS razaosocial,
  parceiros.TIPPESSOA AS tippessoa,
  parceiros.ATIVO AS ativo,
  parceiros.CODEMP AS codemp,

  -- Employee data (if linked)
  funcionarios.CODFUNC AS codfunc,
  funcionarios.NOMEFUNC AS nomefunc,
  usuarios.NOMEUSU AS nomeusu,
  usuarios.EMAIL AS email,

  -- Company data
  empresa.CODEMP AS empresa_codemp,
  empresa.NOMEFANTASIA AS empresa_nomefantasia

FROM TGFPAR parceiros
LEFT JOIN TFPFUN funcionarios ON parceiros.CODPARC = funcionarios.CODPARC
LEFT JOIN TSIUSU usuarios ON funcionarios.CODEMP = usuarios.CODEMP AND funcionarios.CODFUNC = usuarios.CODFUNC
LEFT JOIN TSIEMP empresa ON parceiros.CODEMP = empresa.CODEMP

WHERE
  parceiros.CODPARC = @codparc
  AND parceiros.ATIVO = 'S'
  AND REPLACE(REPLACE(REPLACE(REPLACE(parceiros.CGC_CPF, '.', ''), '-', ''), '/', ''), ' ', '') = '@cpfSanitized'
`;
