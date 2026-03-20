export const timelineAquisicoes = `
SELECT
    FORMAT(b.DTCOMPRA, 'yyyy-MM') AS mes,
    SUM(ISNULL(b.VLRAQUISICAO, 0)) AS valorAcumulado,
    COUNT(*) AS quantidade
FROM SANKHYA.TCIBEM b
WHERE b.DTCOMPRA IS NOT NULL AND b.CODBEM NOT LIKE '%<TODOS>%'
GROUP BY FORMAT(b.DTCOMPRA, 'yyyy-MM')
ORDER BY FORMAT(b.DTCOMPRA, 'yyyy-MM')
`;
