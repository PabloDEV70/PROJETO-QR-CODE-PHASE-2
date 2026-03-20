export const pesquisar = `
SELECT TOP 50
  parceiros.CODPARC AS codparc,
  parceiros.NOMEPARC AS nomeparc,
  parceiros.CGC_CPF AS cgc_cpf,
  parceiros.TIPPESSOA AS tippessoa,
  parceiros.ATIVO AS ativo,
  parceiros.RAZAOSOCIAL AS razaosocial
FROM TGFPAR AS parceiros
WHERE (
  parceiros.NOMEPARC LIKE '%@sanitized%'
  OR REPLACE(REPLACE(REPLACE(REPLACE(parceiros.CGC_CPF, '.', ''), '-', ''), '/', ''), ' ', '') LIKE '%@sanitizedDocument%'
  OR CAST(parceiros.CODPARC AS VARCHAR) = '@sanitized'
)
ORDER BY parceiros.NOMEPARC
`;
