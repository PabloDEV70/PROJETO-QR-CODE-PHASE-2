export const situacoes = `
SELECT s.ID, s.DESCRICAO, s.CODDEP, s.OBS, dep.DESCRDEP AS departamentoNome
FROM AD_ADHSTVEISIT s
LEFT JOIN TFPDEP dep ON dep.CODDEP = s.CODDEP
ORDER BY s.ID
`;
