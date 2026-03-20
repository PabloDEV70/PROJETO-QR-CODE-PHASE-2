/**
 * Dashboard: OS agrupadas por tipo de manutenção
 */
export const dashboardPorTipo = `
SELECT
  os.MANUTENCAO as manutencao,
  CASE os.MANUTENCAO
    WHEN 'P' THEN 'Preventiva'
    WHEN 'C' THEN 'Corretiva'
    WHEN 'R' THEN 'Reforma'
    WHEN 'S' THEN 'Socorro'
    WHEN 'T' THEN 'Retorno'
    WHEN 'O' THEN 'Outros'
    WHEN '1' THEN 'Revisao em Garantia'
    WHEN '2' THEN 'Corretiva Programada'
    WHEN '5' THEN 'Borracharia'
    ELSE os.MANUTENCAO
  END as manutencaoLabel,
  COUNT(*) as total
FROM TCFOSCAB os
WHERE os.MANUTENCAO IS NOT NULL
GROUP BY os.MANUTENCAO
`;
