export const osObservacao = `
SELECT
  CAST(OBSERVACAO AS VARCHAR(MAX)) as observacao
FROM TCFOSCAB
WHERE NUOS = @nuos
`;
