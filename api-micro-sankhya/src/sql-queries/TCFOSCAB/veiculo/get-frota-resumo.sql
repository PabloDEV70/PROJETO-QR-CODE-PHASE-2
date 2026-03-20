-- Resumo Consolidado da Frota (sem AD_EXIBEDASH para compatibilidade)
SELECT
  COUNT(*) AS totalVeiculos,
  SUM(CASE WHEN status = 'OPERACIONAL' THEN 1 ELSE 0 END) AS operacionais,
  SUM(CASE WHEN status = 'EM_MANUTENCAO' THEN 1 ELSE 0 END) AS emManutencao,
  SUM(CASE WHEN status = 'BLOQUEADO' THEN 1 ELSE 0 END) AS bloqueados,
  CAST(100.0 * SUM(CASE WHEN status = 'OPERACIONAL' THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0) AS DECIMAL(5,2)) AS percentualOperacional,
  SUM(osAtivas) AS totalOsAtivas,
  SUM(osBloqueadas) AS totalOsBloqueadas
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
    END AS status,
    (SELECT COUNT(*) FROM TCFOSCAB os
     WHERE os.CODVEICULO = vei.CODVEICULO
       AND os.STATUS <> 'F') AS osAtivas,
    (SELECT COUNT(*) FROM TCFOSCAB os
     WHERE os.CODVEICULO = vei.CODVEICULO
       AND os.STATUS <> 'F'
       AND os.AD_BLOQUEIOS = 'S') AS osBloqueadas
  FROM TGFVEI vei
  WHERE vei.ATIVO = 'S'
) status_sub
