export const nextSeq = `
SELECT ISNULL(MAX(SEQ), 0) + 1 AS nextSeq
FROM AD_APONTSOL
WHERE CODIGO = @codigo
`;
