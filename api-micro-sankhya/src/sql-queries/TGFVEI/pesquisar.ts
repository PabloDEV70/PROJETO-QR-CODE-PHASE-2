export const pesquisar = `
SELECT TOP 30
  v.CODVEICULO AS codveiculo,
  v.PLACA AS placa,
  CAST(v.MARCAMODELO AS VARCHAR(200)) AS marcamodelo,
  CAST(ISNULL(v.AD_TIPOEQPTO, v.CATEGORIA) AS VARCHAR(100)) AS categoria,
  CAST(ISNULL(v.ESPECIETIPO, '') AS VARCHAR(100)) AS tipo,
  CAST(ISNULL(v.AD_FABRICANTE, '') AS VARCHAR(100)) AS fabricante,
  CAST(ISNULL(v.AD_CAPACIDADE, '') AS VARCHAR(100)) AS capacidade,
  v.ANOFABRIC AS anofabric,
  v.ANOMOD AS anomod,
  v.COMBUSTIVEL AS combustivel,
  v.KMACUM AS kmacum,
  v.ATIVO AS ativo,
  v.BLOQUEADO AS bloqueado,
  CAST(ISNULL(v.AD_TAG, '') AS VARCHAR(100)) AS tag,
  ISNULL(v.AD_EXIBEDASH, 'N') AS exibeDash
FROM SANKHYA.TGFVEI v
WHERE v.ATIVO = 'S'
  AND (
    v.PLACA LIKE '%@term%'
    OR CAST(v.MARCAMODELO AS VARCHAR(200)) LIKE '%@term%'
    OR v.CHASSIS LIKE '%@term%'
    OR v.RENAVAM LIKE '%@term%'
    OR CAST(v.CODVEICULO AS VARCHAR) = '@term'
    OR CAST(ISNULL(v.AD_TAG, '') AS VARCHAR(100)) LIKE '%@term%'
  )
ORDER BY v.PLACA
`;
