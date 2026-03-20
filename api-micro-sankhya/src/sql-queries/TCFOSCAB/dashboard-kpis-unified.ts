/**
 * Dashboard KPIs unificados em uma query
 * Retorna totalOS, MTTR, status distribution, type distribution
 * Query validada contra SQL Server 2005 compativel
 * NO CTE - usa inline subqueries
 * NO TEXT fields - evita OBSERVACAO
 */
export const dashboardKpisUnified = `
SELECT
  -- Total de OSs
  (SELECT COUNT(*) FROM TCFOSCAB) AS totalOS,

  -- MTTR: media de horas para fechar OS (STATUS = 'F', com datas validas)
  (SELECT AVG(CAST(DATEDIFF(HOUR, DTABERTURA, DATAFIN) AS FLOAT))
   FROM TCFOSCAB
   WHERE STATUS = 'F'
     AND DTABERTURA IS NOT NULL
     AND DATAFIN IS NOT NULL
     AND DATAFIN >= DTABERTURA) AS mttrHoras,

  -- Status distribution
  (SELECT COUNT(*) FROM TCFOSCAB WHERE STATUS = 'A') AS statusAberta,
  (SELECT COUNT(*) FROM TCFOSCAB WHERE STATUS = 'E') AS statusEmExecucao,
  (SELECT COUNT(*) FROM TCFOSCAB WHERE STATUS = 'F') AS statusFinalizada,
  (SELECT COUNT(*) FROM TCFOSCAB WHERE STATUS = 'C') AS statusCancelada,

  -- Type distribution (MANUTENCAO)
  (SELECT COUNT(*) FROM TCFOSCAB WHERE MANUTENCAO = 'C') AS tipoCorretiva,
  (SELECT COUNT(*) FROM TCFOSCAB WHERE MANUTENCAO = 'P') AS tipoPreventiva,
  (SELECT COUNT(*) FROM TCFOSCAB WHERE MANUTENCAO NOT IN ('C', 'P')) AS tipoOutros
`;
