export const osManutencaoTotals = `
  SELECT
    COUNT(*) as totalOSManutencao,
    SUM(CASE WHEN STATUS = 'F' THEN 1 ELSE 0 END) as osManutencaoFechadas
  FROM TCFOSCAB
`;

export const osComercialTotals = `
  SELECT
    COUNT(*) as totalOSComercial,
    SUM(CASE WHEN SITUACAO = 'F' THEN 1 ELSE 0 END) as osComercialFechadas
  FROM TCSOSE
`;

export const tempoMedioResolucao = `
  SELECT
    NULL as tempoMedio
`;

export const horasRDOUltimoMes = `
  SELECT
    ISNULL(SUM(
      ((det.HRFIM / 100) * 60 + (det.HRFIM % 100)) -
      ((det.HRINI / 100) * 60 + (det.HRINI % 100))
    ), 0) / 60.0 as totalHoras
  FROM AD_RDOAPONTAMENTOS rdo
  INNER JOIN AD_RDOAPONDETALHES det ON rdo.CODRDO = det.CODRDO
  WHERE rdo.DTREF >= DATEADD(MONTH, -1, GETDATE())
`;

export const mediaItensPorRDO = `
  SELECT
    AVG(CAST(itemCount AS FLOAT)) as mediaItens
  FROM (
    SELECT COUNT(det.ITEM) as itemCount
    FROM AD_RDOAPONTAMENTOS rdo
    LEFT JOIN AD_RDOAPONDETALHES det ON rdo.CODRDO = det.CODRDO
    GROUP BY rdo.CODRDO
  ) AS T
`;
