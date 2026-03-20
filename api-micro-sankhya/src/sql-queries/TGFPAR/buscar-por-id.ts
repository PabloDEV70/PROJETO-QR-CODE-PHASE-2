export const buscarPorId = `
SELECT TOP 1
  parceiros.CODPARC AS codparc,
  parceiros.NOMEPARC AS nomeparc,
  parceiros.CGC_CPF AS cgc_cpf,
  CASE parceiros.TIPPESSOA
    WHEN 'F' THEN
      SUBSTRING(parceiros.CGC_CPF, 1, 3) + '.' +
      SUBSTRING(parceiros.CGC_CPF, 4, 3) + '.' +
      SUBSTRING(parceiros.CGC_CPF, 7, 3) + '-' +
      SUBSTRING(parceiros.CGC_CPF, 10, 2)
    WHEN 'J' THEN
      SUBSTRING(parceiros.CGC_CPF, 1, 2) + '.' +
      SUBSTRING(parceiros.CGC_CPF, 3, 3) + '.' +
      SUBSTRING(parceiros.CGC_CPF, 6, 3) + '/' +
      SUBSTRING(parceiros.CGC_CPF, 9, 4) + '-' +
      SUBSTRING(parceiros.CGC_CPF, 13, 2)
    ELSE parceiros.CGC_CPF
  END AS cgc_cpf_formatted,
  parceiros.TIPPESSOA AS tippessoa,
  parceiros.ATIVO AS ativo,
  parceiros.RAZAOSOCIAL AS razaosocial,
  parceiros.CLIENTE AS cliente,
  parceiros.FORNECEDOR AS fornecedor,
  parceiros.MOTORISTA AS motorista,
  parceiros.VENDEDOR AS vendedor
FROM TGFPAR AS parceiros
WHERE parceiros.CODPARC = @codparc
`;
