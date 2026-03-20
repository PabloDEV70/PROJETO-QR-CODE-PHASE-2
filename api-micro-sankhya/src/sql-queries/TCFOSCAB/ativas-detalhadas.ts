/**
 * OS Ativas com detalhes operacionais
 * Inclui dias em manutenção, situação de prazo, progresso de serviços
 * Query validada contra PROD em 06/02/2026
 */
export const ativasDetalhadas = `
SELECT TOP @limit
  cab.NUOS AS nuos,
  cab.CODVEICULO AS codveiculo,
  v.PLACA AS placa,
  cab.STATUS AS status,
  CASE cab.STATUS
    WHEN 'A' THEN 'Aberta'
    WHEN 'E' THEN 'Em Execucao'
  END AS statusDesc,
  cab.MANUTENCAO AS manutencao,
  CASE cab.MANUTENCAO
    WHEN 'C' THEN 'Corretiva'
    WHEN 'P' THEN 'Preventiva'
    WHEN '5' THEN 'Borracharia'
    WHEN '1' THEN 'Revisao em Garantia'
    WHEN '2' THEN 'Corretiva Programada'
    WHEN 'R' THEN 'Reforma'
    WHEN 'S' THEN 'Socorro'
    WHEN 'O' THEN 'Outros'
    ELSE cab.MANUTENCAO
  END AS manutencaoDesc,
  cab.DATAINI AS dataIni,
  cab.PREVISAO AS previsao,
  DATEDIFF(DAY, cab.DATAINI, GETDATE()) AS diasEmManutencao,
  CASE
    WHEN cab.PREVISAO < GETDATE() THEN 'ATRASADA'
    WHEN cab.PREVISAO < DATEADD(DAY, 2, GETDATE()) THEN 'PROXIMA'
    ELSE 'NO_PRAZO'
  END AS situacaoPrazo,
  (SELECT COUNT(*) FROM TCFSERVOS s WHERE s.NUOS = cab.NUOS) AS qtdServicos,
  (SELECT COUNT(*) FROM TCFSERVOS s WHERE s.NUOS = cab.NUOS AND s.STATUS = 'F') AS servicosConcluidos,
  cab.AD_STATUSGIG AS adStatusGig,
  cab.AD_BLOQUEIOS AS adBloqueios
FROM TCFOSCAB cab
INNER JOIN TGFVEI v ON v.CODVEICULO = cab.CODVEICULO
WHERE cab.STATUS IN ('A', 'E')
  AND cab.DATAFIN IS NULL
ORDER BY diasEmManutencao DESC
`;
