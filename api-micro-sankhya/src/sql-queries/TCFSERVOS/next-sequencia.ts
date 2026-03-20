export const nextSequencia = `
SELECT ISNULL(MAX(SEQUENCIA), 0) + 1 AS nextSequencia
FROM TCFSERVOS
WHERE NUOS = @nuos
`;
