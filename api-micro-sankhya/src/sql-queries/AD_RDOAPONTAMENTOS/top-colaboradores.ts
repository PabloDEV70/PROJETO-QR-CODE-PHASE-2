export const topColaboradores = `
SELECT TOP 10
  rdo.CODPARC,
  parc.NOMEPARC as nomeparc,
  COUNT(DISTINCT rdo.CODRDO) as totalRdos,
  SUM(CASE WHEN det.HRFIM > det.HRINI AND det.HRFIM <= 2400 THEN
    ((det.HRFIM / 100) * 60 + (det.HRFIM % 100)) -
    ((det.HRINI / 100) * 60 + (det.HRINI % 100))
  ELSE 0 END) / 60.0 as totalHoras
FROM AD_RDOAPONTAMENTOS rdo
INNER JOIN AD_RDOAPONDETALHES det ON rdo.CODRDO = det.CODRDO
LEFT JOIN TGFPAR parc ON rdo.CODPARC = parc.CODPARC
WHERE rdo.CODPARC IS NOT NULL -- @WHERE_RDO
GROUP BY rdo.CODPARC, parc.NOMEPARC
ORDER BY totalHoras DESC
`;
