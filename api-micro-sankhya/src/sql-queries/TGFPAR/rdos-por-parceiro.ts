export const rdosPorParceiro = `
  SELECT * FROM (
    SELECT
      rdo.CODRDO,
      CONVERT(VARCHAR(10), rdo.DTREF, 23) AS DTREF,
      (SELECT COUNT(*) FROM AD_RDOAPONDETALHES d WHERE d.CODRDO = rdo.CODRDO) as totalItens,
      ROW_NUMBER() OVER (ORDER BY rdo.DTREF DESC) AS RowNum
    FROM AD_RDOAPONTAMENTOS rdo
    WHERE rdo.CODPARC = @codparc
    -- @WHERE
  ) AS T
  WHERE RowNum > @OFFSET AND RowNum <= (@OFFSET + @LIMIT)
`;
