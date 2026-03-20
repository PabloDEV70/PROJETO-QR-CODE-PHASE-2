export const listar = `
SELECT * FROM (
  SELECT
    u.CODUSU AS codusu,
    u.NOMEUSU AS nomeusu,
    u.EMAIL AS email,
    u.CODPARC AS codparc,
    p.NOMEPARC AS nomeparc,
    u.CODEMP AS codemp,
    e.NOMEFANTASIA AS nomeempresa,
    u.CODFUNC AS codfunc,
    CASE WHEN u.DTLIMACESSO IS NULL OR u.DTLIMACESSO >= GETDATE() THEN 'S' ELSE 'N' END AS ativo,
    ROW_NUMBER() OVER (ORDER BY -- @ORDER
    ) AS RowNum
  FROM TSIUSU u
  LEFT JOIN TGFPAR p ON u.CODPARC = p.CODPARC
  LEFT JOIN TSIEMP e ON u.CODEMP = e.CODEMP
  WHERE 1=1
  -- @WHERE
) AS T
WHERE RowNum > @OFFSET AND RowNum <= (@OFFSET + @LIMIT)
`;
