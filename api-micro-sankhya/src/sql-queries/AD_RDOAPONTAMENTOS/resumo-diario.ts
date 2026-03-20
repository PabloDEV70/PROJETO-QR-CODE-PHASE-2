export const resumoDiario = `
SELECT * FROM (
  SELECT
    CONVERT(VARCHAR(10), rdo.DTREF, 23) as DTREF,
    COUNT(DISTINCT rdo.CODRDO) as totalRdos,
    COUNT(det.ITEM) as totalItens,
    SUM(CASE WHEN det.HRFIM > det.HRINI AND det.HRFIM <= 2400 THEN
      ((det.HRFIM / 100) * 60 + (det.HRFIM % 100)) -
      ((det.HRINI / 100) * 60 + (det.HRINI % 100))
    ELSE 0 END) / 60.0 as totalHoras,
    ROW_NUMBER() OVER (ORDER BY rdo.DTREF DESC) AS RowNum
  FROM AD_RDOAPONTAMENTOS rdo
  LEFT JOIN AD_RDOAPONDETALHES det ON rdo.CODRDO = det.CODRDO
  WHERE 1=1
  -- @WHERE
  GROUP BY rdo.DTREF
) AS T
WHERE RowNum > @OFFSET AND RowNum <= (@OFFSET + @LIMIT)
`;
