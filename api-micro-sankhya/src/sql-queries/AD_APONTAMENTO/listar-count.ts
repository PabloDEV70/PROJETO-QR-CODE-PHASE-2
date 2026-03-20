export const listarCount = `
SELECT COUNT(*) AS totalRegistros
FROM AD_APONTAMENTO A WITH (NOLOCK)
WHERE 1=1
-- @WHERE
`;
