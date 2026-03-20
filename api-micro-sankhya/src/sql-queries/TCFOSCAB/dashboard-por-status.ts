/**
 * Dashboard: OS agrupadas por status
 */
export const dashboardPorStatus = `
SELECT
  os.STATUS as status,
  CASE os.STATUS
    WHEN 'F' THEN 'Finalizada'
    WHEN 'A' THEN 'Aberta'
    WHEN 'E' THEN 'Em Execucao'
    WHEN 'C' THEN 'Cancelada'
    ELSE os.STATUS
  END as statusLabel,
  COUNT(*) as total
FROM TCFOSCAB os
GROUP BY os.STATUS
`;
