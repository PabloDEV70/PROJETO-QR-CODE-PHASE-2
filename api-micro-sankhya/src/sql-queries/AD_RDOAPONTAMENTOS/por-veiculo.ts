export const porVeiculo = `
SELECT * FROM (
  SELECT DISTINCT
    rdo.CODRDO,
    rdo.CODPARC,
    CONVERT(VARCHAR(10), rdo.DTREF, 23) as DTREF,
    parc.NOMEPARC as nomeparc,
    parc.CGC_CPF as cgc_cpf,
    (
      SELECT COUNT(*)
      FROM AD_RDOAPONDETALHES d
      WHERE d.CODRDO = rdo.CODRDO
    ) as totalItens,
    (
      SELECT SUM(CASE WHEN d.HRFIM > d.HRINI AND d.HRFIM <= 2400 THEN
        ((d.HRFIM / 100) * 60 + (d.HRFIM % 100)) -
        ((d.HRINI / 100) * 60 + (d.HRINI % 100))
      ELSE 0 END) / 60.0
      FROM AD_RDOAPONDETALHES d
      WHERE d.CODRDO = rdo.CODRDO
    ) as totalHoras,
    ROW_NUMBER() OVER (ORDER BY rdo.DTREF DESC) AS RowNum
  FROM AD_RDOAPONTAMENTOS rdo
  INNER JOIN AD_RDOAPONDETALHES det ON rdo.CODRDO = det.CODRDO
  INNER JOIN TCFOSCAB os ON det.NUOS = os.NUOS
  LEFT JOIN TGFPAR parc ON rdo.CODPARC = parc.CODPARC
  WHERE os.CODVEICULO = @codveiculo
) AS T
WHERE RowNum > @OFFSET AND RowNum <= (@OFFSET + @LIMIT)
`;
