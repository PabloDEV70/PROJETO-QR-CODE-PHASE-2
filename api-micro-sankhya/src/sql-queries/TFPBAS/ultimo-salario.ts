/**
 * Busca ultimo salario normal (TIPFOLHA='N') de um funcionario
 * Usa CODEMP + CODFUNC para identificar
 */
export const ultimoSalario = `
SELECT TOP 1
  BAS.SALBASE AS salBase,
  BAS.SALBRUTO AS salBruto,
  BAS.SALLIQ AS salLiq,
  CONVERT(VARCHAR(10), BAS.DTPAGAMENTO, 120) AS dtPagamento,
  BAS.DIASTRAB AS diasTrabalhados,
  BAS.REFERENCIA AS referencia,
  CASE BAS.TIPFOLHA
    WHEN 'N' THEN 'Folha Normal'
    WHEN 'F' THEN 'Ferias'
    WHEN 'R' THEN 'Rescisao'
    WHEN 'A' THEN 'Adiantamento'
    WHEN 'D' THEN 'Decimo Terceiro'
    ELSE 'Outro'
  END AS tipFolhaDescricao
FROM TFPBAS BAS
WHERE BAS.CODEMP = @codemp
  AND BAS.CODFUNC = @codfunc
  AND BAS.TIPFOLHA = 'N'
  AND BAS.SALBRUTO > 0
ORDER BY BAS.DTPAGAMENTO DESC
`;
