export const painel = `
-- OS por Status
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

-- OS por Tipo de Manutencao
SELECT
  os.MANUTENCAO as manutencao,
  CASE os.MANUTENCAO
    WHEN 'P' THEN 'Preventiva'
    WHEN 'C' THEN 'Corretiva'
    WHEN 'R' THEN 'Reforma'
    WHEN 'S' THEN 'Socorro'
    WHEN 'T' THEN 'Retorno'
    WHEN 'O' THEN 'Outros'
    ELSE os.MANUTENCAO
  END as manutencaoLabel,
  COUNT(*) as total
FROM TCFOSCAB os
WHERE os.MANUTENCAO IS NOT NULL
GROUP BY os.MANUTENCAO

-- OS Recentes (ultimos 30 dias)
SELECT TOP 20
  os.NUOS,
  os.DTABERTURA,
  os.STATUS,
  CASE os.STATUS
    WHEN 'F' THEN 'Finalizada'
    WHEN 'A' THEN 'Aberta'
    WHEN 'E' THEN 'Em Execucao'
    WHEN 'C' THEN 'Cancelada'
    ELSE os.STATUS
  END as statusLabel,
  os.MANUTENCAO,
  CASE os.MANUTENCAO
    WHEN 'P' THEN 'Preventiva'
    WHEN 'C' THEN 'Corretiva'
    WHEN 'R' THEN 'Reforma'
    WHEN 'S' THEN 'Socorro'
    WHEN 'T' THEN 'Retorno'
    WHEN 'O' THEN 'Outros'
    ELSE os.MANUTENCAO
  END as manutencaoLabel,
  os.CODVEICULO,
  v.PLACA as placa,
  CAST(v.MARCAMODELO AS VARCHAR(MAX)) as marcaModelo
FROM TCFOSCAB os
LEFT JOIN TGFVEI v ON os.CODVEICULO = v.CODVEICULO
WHERE os.DTABERTURA >= DATEADD(DAY, -30, GETDATE())
ORDER BY os.DTABERTURA DESC

-- OS para Exibir no Dashboard
SELECT TOP 20
  os.NUOS,
  os.DTABERTURA,
  os.STATUS,
  CASE os.STATUS
    WHEN 'F' THEN 'Finalizada'
    WHEN 'A' THEN 'Aberta'
    WHEN 'E' THEN 'Em Execucao'
    WHEN 'C' THEN 'Cancelada'
    ELSE os.STATUS
  END as statusLabel,
  os.MANUTENCAO,
  CASE os.MANUTENCAO
    WHEN 'P' THEN 'Preventiva'
    WHEN 'C' THEN 'Corretiva'
    WHEN 'R' THEN 'Reforma'
    WHEN 'S' THEN 'Socorro'
    WHEN 'T' THEN 'Retorno'
    WHEN 'O' THEN 'Outros'
    ELSE os.MANUTENCAO
  END as manutencaoLabel,
  os.CODVEICULO,
  v.PLACA as placa,
  CAST(v.MARCAMODELO AS VARCHAR(MAX)) as marcaModelo
FROM TCFOSCAB os
LEFT JOIN TGFVEI v ON os.CODVEICULO = v.CODVEICULO
WHERE os.AD_EXIBEDASH = 'S'
ORDER BY os.DTABERTURA DESC
`;
