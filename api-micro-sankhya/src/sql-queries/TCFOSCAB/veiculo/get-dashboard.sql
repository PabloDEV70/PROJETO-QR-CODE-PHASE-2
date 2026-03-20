-- Dashboard Completo do Veículo
-- Centrado no veículo com todas as informações de manutenção
SELECT * FROM (
  SELECT
    -- Identificação do veículo
    vei.CODVEICULO AS codveiculo,
    vei.PLACA AS placa,
    vei.AD_TAG AS adTag,
    vei.MARCAMODELO AS marcaModelo,
    vei.AD_TIPOEQPTO AS tipoEquipamento,
    vei.KMACUM AS kmAcum,

    -- Status operacional baseado em OS ativas e bloqueios
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
    END AS statusOperacional,

    -- Contagem de OS ativas
    (SELECT COUNT(*) FROM TCFOSCAB os
     WHERE os.CODVEICULO = vei.CODVEICULO
       AND os.STATUS <> 'F') AS osAtivasCount,

    -- Última OS finalizada
    (SELECT TOP 1 os.DATAFIN
     FROM TCFOSCAB os
     WHERE os.CODVEICULO = vei.CODVEICULO
       AND os.STATUS = 'F'
     ORDER BY os.DATAFIN DESC) AS ultimaOsData,

    (SELECT TOP 1 os.KM
     FROM TCFOSCAB os
     WHERE os.CODVEICULO = vei.CODVEICULO
       AND os.STATUS = 'F'
     ORDER BY os.DATAFIN DESC) AS ultimaOsKm,

    (SELECT TOP 1 os.MANUTENCAO
     FROM TCFOSCAB os
     WHERE os.CODVEICULO = vei.CODVEICULO
       AND os.STATUS = 'F'
     ORDER BY os.DATAFIN DESC) AS ultimaOsTipo,

    (SELECT TOP 1 ISNULL(srv.VLRTOT, 0)
     FROM TCFOSCAB os
     INNER JOIN TCFSERVOS srv ON os.NUOS = srv.NUOS
     WHERE os.CODVEICULO = vei.CODVEICULO
       AND os.STATUS = 'F'
     ORDER BY os.DATAFIN DESC) AS ultimaOsCusto,

    -- Proprietário
    (SELECT TOP 1 p.NOMEPARC
     FROM TGFPAR p
     WHERE p.CODPARC = vei.CODPARC) AS proprietarioNome,

    -- Motorista padrão
    (SELECT TOP 1 p.NOMEPARC
     FROM TGFPAR p
     WHERE p.CODPARC = vei.CODMOTORISTA) AS motoristaNome,

    ROW_NUMBER() OVER (ORDER BY vei.CODVEICULO) AS RowNum
  FROM TGFVEI vei
  WHERE vei.CODVEICULO = @codveiculo
    AND vei.ATIVO = 'S'
) paginated
WHERE RowNum = 1
