export const bemLocalizacao = `
SELECT
    l.CODBEM AS codbem,
    CONVERT(VARCHAR(10), l.DTENTRADA, 103) AS dtEntrada,
    l.CODEMP AS empresa,
    l.CODDEPTO AS departamento,
    l.CODUSU AS usuario,
    l.NUNOTA AS nunota
FROM SANKHYA.TCILOC l
WHERE RTRIM(l.CODBEM) = '@codbem'
ORDER BY l.DTENTRADA DESC
`;
