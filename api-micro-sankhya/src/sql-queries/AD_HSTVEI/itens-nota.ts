export const itensNota = `
SELECT
  ite.NUNOTA AS nunota,
  ite.SEQUENCIA AS sequencia,
  ite.CODPROD AS codprod,
  CAST(pro.DESCRPROD AS VARCHAR(300)) AS produto,
  ite.QTDNEG AS quantidade,
  ite.VLRUNIT AS valorUnitario,
  ite.VLRTOT AS valorTotal,
  ite.CODEXEC AS codexec,
  uexec.NOMEUSU AS executor
FROM TGFITE ite
INNER JOIN TGFPRO pro ON pro.CODPROD = ite.CODPROD
LEFT JOIN TSIUSU uexec ON uexec.CODUSU = ite.CODEXEC
WHERE ite.NUNOTA = @nunota
ORDER BY ite.SEQUENCIA
`;
