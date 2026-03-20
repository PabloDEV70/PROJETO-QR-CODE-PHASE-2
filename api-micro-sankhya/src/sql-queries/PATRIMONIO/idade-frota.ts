export const idadeFrota = `
SELECT faixa, SUM(quantidade) AS quantidade
FROM (
    SELECT
        CASE
          WHEN DATEDIFF(MONTH, b.DTCOMPRA, GETDATE()) <= 12 THEN '0-1 ano'
          WHEN DATEDIFF(MONTH, b.DTCOMPRA, GETDATE()) <= 36 THEN '1-3 anos'
          WHEN DATEDIFF(MONTH, b.DTCOMPRA, GETDATE()) <= 60 THEN '3-5 anos'
          ELSE '5+ anos'
        END AS faixa,
        CASE
          WHEN DATEDIFF(MONTH, b.DTCOMPRA, GETDATE()) <= 12 THEN 1
          WHEN DATEDIFF(MONTH, b.DTCOMPRA, GETDATE()) <= 36 THEN 2
          WHEN DATEDIFF(MONTH, b.DTCOMPRA, GETDATE()) <= 60 THEN 3
          ELSE 4
        END AS ordem,
        1 AS quantidade
    FROM SANKHYA.TCIBEM b
    WHERE b.DTBAIXA IS NULL AND b.DTCOMPRA IS NOT NULL AND b.CODBEM NOT LIKE '%<TODOS>%'
) sub
GROUP BY faixa, ordem
ORDER BY ordem
`;
