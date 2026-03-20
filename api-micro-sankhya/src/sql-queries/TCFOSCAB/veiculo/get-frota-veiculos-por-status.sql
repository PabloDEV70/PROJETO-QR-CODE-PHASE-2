-- Lista de Veículos por Status (para detalhamento)
SELECT * FROM (
  SELECT
    vei.CODVEICULO AS codveiculo,
    vei.PLACA AS placa,
    vei.AD_TAG AS adTag,
    vei.MARCAMODELO AS marcaModelo,
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
    ROW_NUMBER() OVER (ORDER BY vei.AD_TAG, vei.PLACA) AS RowNum
  FROM TGFVEI vei
  WHERE vei.ATIVO = 'S'
    AND vei.AD_EXIBEDASH = 'S'
    AND (@status IS NULL OR
      CASE
        WHEN EXISTS (SELECT 1 FROM TCFOSCAB os WHERE os.CODVEICULO = vei.CODVEICULO AND os.STATUS <> 'F' AND os.AD_BLOQUEIOS = 'S')
        THEN 'BLOQUEADO'
        WHEN EXISTS (SELECT 1 FROM TCFOSCAB os WHERE os.CODVEICULO = vei.CODVEICULO AND os.STATUS <> 'F')
        THEN 'EM_MANUTENCAO'
        ELSE 'OPERACIONAL'
      END = @status)
) paginated
WHERE RowNum > @OFFSET AND RowNum <= (@OFFSET + @LIMIT)
