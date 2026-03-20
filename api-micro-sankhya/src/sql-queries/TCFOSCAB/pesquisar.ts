export const pesquisar = `
SELECT TOP 50
  os.NUOS,
  os.DTABERTURA,
  os.STATUS,
  os.MANUTENCAO,
  os.AD_STATUSGIG,
  os.CODVEICULO,
  os.CODPARC,
  os.KM,
  os.HORIMETRO,
  v.PLACA as placa,
  CAST(v.MARCAMODELO AS VARCHAR(MAX)) as marcaModelo,
  v.AD_TAG as tagVeiculo,
  p.NOMEPARC as nomeParc,
  CASE os.STATUS
    WHEN 'F' THEN 'Finalizada'
    WHEN 'A' THEN 'Aberta'
    WHEN 'E' THEN 'Em Execucao'
    WHEN 'C' THEN 'Cancelada'
    ELSE os.STATUS
  END as statusLabel,
  CASE os.MANUTENCAO
    WHEN 'P' THEN 'Preventiva'
    WHEN 'C' THEN 'Corretiva'
    WHEN 'R' THEN 'Reforma'
    WHEN 'S' THEN 'Socorro'
    WHEN 'T' THEN 'Retorno'
    WHEN 'O' THEN 'Outros'
    ELSE os.MANUTENCAO
  END as manutencaoLabel
FROM TCFOSCAB os
LEFT JOIN TGFVEI v ON os.CODVEICULO = v.CODVEICULO
LEFT JOIN TGFPAR p ON os.CODPARC = p.CODPARC
WHERE
  (
    os.NUOS = TRY_CAST('@sanitizedTerm' AS INT)
    OR v.PLACA LIKE '%@sanitizedTerm%'
    OR p.NOMEPARC LIKE '%@sanitizedTerm%'
  )
ORDER BY os.DTABERTURA DESC
`;
