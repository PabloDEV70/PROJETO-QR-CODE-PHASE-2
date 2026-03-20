-- Status Consolidado da Frota
-- Status Consolidado da Frota (versao simples)
SELECT
  status,
  COUNT(*) AS count
FROM (
  SELECT
    vei.CODVEICULO,
    CASE
      WHEN EXISTS (
        SELECT 1 FROM TCFOSCAB os
        WHERE os.CODVEICULO = vei.CODVEICULO
          AND os.STATUS <> 'F'
          AND os.AD_BLOQUEIOS = 'S'
      ) THEN 'BLOQUEADO'
      WHEN EXISTS (
        SELECT 1 FROM TCFOSCAB os
        WHERE os.CODVEICULO = vei.CODVEICULO
          AND os.STATUS <> 'F'
      ) THEN 'EM_MANUTENCAO'
      ELSE 'OPERACIONAL'
    END AS status
  FROM TGFVEI vei
  WHERE vei.ATIVO = 'S'
) AS status_view
GROUP BY status
