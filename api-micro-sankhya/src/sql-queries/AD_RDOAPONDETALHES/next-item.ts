export const nextItem = `
SELECT ISNULL(MAX(ITEM), 0) + 1 AS nextItem
FROM AD_RDOAPONDETALHES
WHERE CODRDO = @codrdo
`;
