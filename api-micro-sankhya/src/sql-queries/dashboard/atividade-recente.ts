export const atividadeRecente = `
  SELECT * FROM (
    SELECT
      'RDO' as tipoAtividade,
      CAST(rdo.CODRDO AS VARCHAR) as referencia,
      CONVERT(VARCHAR(19), rdo.DTREF, 120) as dataAtividade,
      parc.NOMEPARC as descricao,
      NULL as extra,
      ROW_NUMBER() OVER (ORDER BY rdo.DTREF DESC) AS RowNum
    FROM AD_RDOAPONTAMENTOS rdo
    LEFT JOIN TGFPAR parc ON rdo.CODPARC = parc.CODPARC
    WHERE rdo.DTREF >= DATEADD(DAY, -30, GETDATE())
  ) AS RDOs
  WHERE RowNum <= 20

  UNION ALL

  SELECT * FROM (
    SELECT
      'OS_MANUTENCAO' as tipoAtividade,
      CAST(os.NUOS AS VARCHAR) as referencia,
      CONVERT(VARCHAR(19), os.DTABERTURA, 120) as dataAtividade,
      v.PLACA as descricao,
      os.STATUS as extra,
      ROW_NUMBER() OVER (ORDER BY os.DTABERTURA DESC) AS RowNum
    FROM TCFOSCAB os
    LEFT JOIN TGFVEI v ON os.CODVEICULO = v.CODVEICULO
    WHERE os.DTABERTURA >= DATEADD(DAY, -30, GETDATE())
  ) AS OSManutencao
  WHERE RowNum <= 20

  UNION ALL

  SELECT * FROM (
    SELECT
      'OS_COMERCIAL' as tipoAtividade,
      CAST(os.NUMOS AS VARCHAR) as referencia,
      CONVERT(VARCHAR(19), os.DHCHAMADA, 120) as dataAtividade,
      parc.NOMEPARC as descricao,
      os.SITUACAO as extra,
      ROW_NUMBER() OVER (ORDER BY os.DHCHAMADA DESC) AS RowNum
    FROM TCSOSE os
    LEFT JOIN TGFPAR parc ON os.CODPARC = parc.CODPARC
    WHERE os.DHCHAMADA >= DATEADD(DAY, -30, GETDATE())
  ) AS OSComercial
  WHERE RowNum <= 20

  ORDER BY dataAtividade DESC
`;
