export const osPendentes = `
  SELECT * FROM (
    SELECT
      'MANUTENCAO' as tipo,
      CAST(os.NUOS AS VARCHAR) as numeroOS,
      CONVERT(VARCHAR(19), os.DTABERTURA, 120) as dataAbertura,
      os.STATUS as status,
      v.PLACA as veiculoPlaca,
      ROW_NUMBER() OVER (ORDER BY os.DTABERTURA DESC) AS RowNum
    FROM TCFOSCAB os
    LEFT JOIN TGFVEI v ON os.CODVEICULO = v.CODVEICULO
    WHERE os.STATUS <> 'F'

    UNION ALL

    SELECT
      'COMERCIAL' as tipo,
      CAST(os.NUMOS AS VARCHAR) as numeroOS,
      CONVERT(VARCHAR(19), os.DHCHAMADA, 120) as dataAbertura,
      os.SITUACAO as status,
      NULL as veiculoPlaca,
      ROW_NUMBER() OVER (ORDER BY os.DHCHAMADA DESC) AS RowNum
    FROM TCSOSE os
    WHERE os.SITUACAO <> 'F'
  ) AS T
  WHERE RowNum <= 50
  ORDER BY dataAbertura DESC
`;
