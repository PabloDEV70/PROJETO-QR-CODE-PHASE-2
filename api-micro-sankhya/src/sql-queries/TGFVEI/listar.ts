export const listar = `
SELECT * FROM (
  SELECT
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
    ISNULL(v.AD_EXIBEDASH, 'N') AS exibeDash,
    ROW_NUMBER() OVER (ORDER BY -- @ORDER
    ) AS RowNum
  FROM SANKHYA.TGFVEI v
  WHERE 1=1
  -- @WHERE
) AS T
WHERE RowNum > @OFFSET AND RowNum <= (@OFFSET + @LIMIT)
`;
