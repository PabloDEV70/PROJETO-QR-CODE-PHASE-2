export const listar = `
SELECT * FROM (
  SELECT
    parceiros.CODPARC AS codparc,
    parceiros.NOMEPARC AS nomeparc,
    parceiros.CGC_CPF AS cgcCpf,
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
    END AS cgcCpfFormatted,
    parceiros.TIPPESSOA AS tippessoa,
    parceiros.ATIVO AS ativo,
    parceiros.RAZAOSOCIAL AS razaosocial,
    parceiros.CLIENTE AS cliente,
    parceiros.FORNECEDOR AS fornecedor,
    parceiros.MOTORISTA AS motorista,
    CASE WHEN vend.CODPARC IS NOT NULL THEN 'S' ELSE 'N' END AS vendedor,
    CASE WHEN tfp.CODPARC IS NOT NULL THEN 'S' ELSE 'N' END AS funcionario,
    CASE WHEN tsu.CODPARC IS NOT NULL THEN 'S' ELSE 'N' END AS usuario,
    ISNULL(vend.ATUACOMPRADOR, 'N') AS comprador,
    ROW_NUMBER() OVER (ORDER BY -- @ORDER
    ) AS RowNum
  FROM TGFPAR AS parceiros
  LEFT JOIN (SELECT DISTINCT CODPARC FROM TFPFUN) tfp ON tfp.CODPARC = parceiros.CODPARC
  LEFT JOIN (SELECT DISTINCT CODPARC FROM TSIUSU) tsu ON tsu.CODPARC = parceiros.CODPARC
  LEFT JOIN TGFVEN vend ON vend.CODPARC = parceiros.CODPARC AND vend.ATIVO = 'S'
  WHERE 1=1
  -- @WHERE
) AS T
WHERE RowNum > @OFFSET AND RowNum <= (@OFFSET + @LIMIT)
`;
