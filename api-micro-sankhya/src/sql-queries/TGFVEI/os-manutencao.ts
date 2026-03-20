export const osManutencao = `
SELECT
  m.NUOS AS nuos,
  m.CODVEICULO AS codveiculo,
  m.STATUS AS status,
  CASE m.STATUS
    WHEN 'A' THEN 'Aberta'
    WHEN 'E' THEN 'Em Execucao'
    WHEN 'F' THEN 'Finalizada'
    ELSE m.STATUS
  END AS statusDescricao,
  ISNULL(m.TIPO, '') AS tipo,
  CASE m.TIPO
    WHEN 'C' THEN 'Corretiva'
    WHEN 'P' THEN 'Preventiva'
    ELSE ISNULL(m.TIPO, '')
  END AS tipoDescricao,
  ISNULL(m.MANUTENCAO, '') AS manutencao,
  CASE m.MANUTENCAO
    WHEN 'I' THEN 'Interna'
    WHEN 'E' THEN 'Externa'
    WHEN 'P' THEN 'Preventiva'
    ELSE ISNULL(m.MANUTENCAO, '')
  END AS manutencaoDescricao,
  CONVERT(VARCHAR, m.DATAINI, 120) AS dataini,
  CONVERT(VARCHAR, m.PREVISAO, 120) AS previsao,
  CONVERT(VARCHAR, m.DATAFIN, 120) AS datafin,
  m.KM AS km,
  m.HORIMETRO AS horimetro,
  m.CODPARC AS codparc,
  CAST(ISNULL(p.NOMEPARC, '') AS VARCHAR(200)) AS parceiroNome,
  m.AD_STATUSGIG AS statusGig,
  CASE m.AD_STATUSGIG
    WHEN 'AN' THEN 'Aguardando - Nao Impeditiva'
    WHEN 'SN' THEN 'Sem Necessidade'
    ELSE ISNULL(m.AD_STATUSGIG, '')
  END AS statusGigDescricao,
  m.AD_BLOQUEIOS AS bloqueios
FROM SANKHYA.TCFOSCAB m
LEFT JOIN SANKHYA.TGFPAR p ON p.CODPARC = m.CODPARC
WHERE m.CODVEICULO = @codveiculo
  AND m.DATAFIN IS NULL
ORDER BY m.DATAINI DESC
`;
