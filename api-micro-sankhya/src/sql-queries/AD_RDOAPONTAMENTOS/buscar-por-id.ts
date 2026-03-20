export const buscarPorId = `
SELECT
  rdo.CODRDO,
  rdo.CODPARC,
  CONVERT(VARCHAR(10), rdo.DTREF, 23) AS DTREF,
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
    ELSE 0 END)
    FROM AD_RDOAPONDETALHES d
    WHERE d.CODRDO = rdo.CODRDO
  ) as totalMinutos,
  (
    SELECT SUM(CASE WHEN d.HRFIM > d.HRINI AND d.HRFIM <= 2400 THEN
      ((d.HRFIM / 100) * 60 + (d.HRFIM % 100)) -
      ((d.HRINI / 100) * 60 + (d.HRINI % 100))
    ELSE 0 END) / 60.0
    FROM AD_RDOAPONDETALHES d
    WHERE d.CODRDO = rdo.CODRDO
  ) as totalHoras
FROM AD_RDOAPONTAMENTOS rdo
LEFT JOIN TGFPAR parc ON rdo.CODPARC = parc.CODPARC
WHERE rdo.CODRDO = @codrdo
`;
