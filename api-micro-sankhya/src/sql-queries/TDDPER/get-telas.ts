export const getTelas = `
SELECT * FROM (
  SELECT DISTINCT
    p.IDACESSO,
    (SELECT COUNT(*) FROM TDDPER g
     WHERE g.IDACESSO = p.IDACESSO AND g.CODUSU = 0 AND g.CODGRUPO > 0) AS qtdGrupos,
    (SELECT COUNT(*) FROM TDDPER u
     WHERE u.IDACESSO = p.IDACESSO AND u.CODUSU > 0) AS qtdUsuarios,
    ROW_NUMBER() OVER (ORDER BY p.IDACESSO) AS RowNum
  FROM TDDPER p
  WHERE 1=1 @whereClause
) AS T
WHERE RowNum > @offset AND RowNum <= (@offset + @limit)
`;

export const countTelas = `
SELECT COUNT(DISTINCT IDACESSO) AS total
FROM TDDPER
WHERE 1=1 @whereClause
`;
