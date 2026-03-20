/** Lightweight search — NO estoque subquery for fast results */
export const buscarProdutosLeve = `
SELECT TOP @LIMIT
  p.CODPROD,
  RTRIM(CAST(p.DESCRPROD AS VARCHAR(100))) as nome,
  RTRIM(CAST(ISNULL(p.COMPLDESC,'') AS VARCHAR(100))) as complemento,
  RTRIM(CAST(ISNULL(p.MARCA,'') AS VARCHAR(50))) as marca,
  RTRIM(CAST(ISNULL(p.REFERENCIA,'') AS VARCHAR(50))) as referencia,
  p.CODGRUPOPROD,
  RTRIM(CAST(ISNULL(g.DESCRGRUPOPROD,'') AS VARCHAR(60))) as grupo,
  RTRIM(ISNULL(p.CODVOL,'')) as unidade,
  p.USOPROD,
  CASE WHEN p.IMAGEM IS NOT NULL THEN 1 ELSE 0 END as temImagem
FROM TGFPRO p
LEFT JOIN TGFGRU g ON p.CODGRUPOPROD = g.CODGRUPOPROD
WHERE p.ATIVO = 'S'
-- @WHERE
ORDER BY p.DESCRPROD
`;

/** Full product by ID — includes estoque summary */
export const produtoPorId = `
SELECT TOP 1
  p.CODPROD,
  RTRIM(CAST(p.DESCRPROD AS VARCHAR(100))) as nome,
  RTRIM(CAST(ISNULL(p.COMPLDESC,'') AS VARCHAR(200))) as complemento,
  RTRIM(CAST(ISNULL(p.MARCA,'') AS VARCHAR(50))) as marca,
  RTRIM(CAST(ISNULL(p.REFERENCIA,'') AS VARCHAR(50))) as referencia,
  p.CODGRUPOPROD,
  RTRIM(CAST(ISNULL(g.DESCRGRUPOPROD,'') AS VARCHAR(60))) as grupo,
  RTRIM(ISNULL(p.CODVOL,'')) as unidade,
  p.USOPROD,
  p.ATIVO,
  CASE WHEN p.IMAGEM IS NOT NULL THEN 1 ELSE 0 END as temImagem,
  RTRIM(CAST(ISNULL(p.LOCALIZACAO,'') AS VARCHAR(40))) as localizacao,
  ISNULL(p.PESOBRUTO, 0) as pesoBruto,
  ISNULL(p.PESOLIQ, 0) as pesoLiq,
  RTRIM(CAST(ISNULL(p.NCM,'') AS VARCHAR(20))) as ncm,
  ISNULL(est.estoqueTotal, 0) as estoqueTotal,
  ISNULL(est.reservadoTotal, 0) as reservadoTotal,
  ISNULL(est.locaisCount, 0) as locaisComEstoque
FROM TGFPRO p
LEFT JOIN TGFGRU g ON p.CODGRUPOPROD = g.CODGRUPOPROD
LEFT JOIN (
  SELECT CODPROD,
    SUM(ESTOQUE) as estoqueTotal,
    SUM(ISNULL(RESERVADO,0)) as reservadoTotal,
    COUNT(DISTINCT CASE WHEN ESTOQUE > 0 THEN CODLOCAL END) as locaisCount
  FROM TGFEST
  GROUP BY CODPROD
) est ON est.CODPROD = p.CODPROD
WHERE p.CODPROD = @CODPROD
`;

export const estoquePorProduto = `
SELECT
  e.CODEMP,
  e.CODLOCAL,
  RTRIM(CAST(ISNULL(l.DESCRLOCAL,'') AS VARCHAR(80))) as nomeLocal,
  e.ESTOQUE as estoque,
  ISNULL(e.RESERVADO, 0) as reservado,
  e.ESTMIN as estMin,
  e.ESTMAX as estMax,
  RTRIM(ISNULL(e.CONTROLE,'')) as lote,
  e.DTENTRADA
FROM TGFEST e
LEFT JOIN TGFLOC l ON e.CODLOCAL = l.CODLOCAL
WHERE e.CODPROD = @CODPROD AND e.ESTOQUE > 0
ORDER BY e.ESTOQUE DESC
`;

/** Placas (veiculos) que usaram o produto em OS de manutencao */
export const placasPorProduto = `
SELECT
  RTRIM(v.PLACA) as placa,
  RTRIM(v.MARCAMODELO) as modelo,
  COUNT(DISTINCT s.NUOS) as qtdOS,
  MAX(os.DTABERTURA) as ultimaOS
FROM TCFSERVOS s
JOIN TCFOSCAB os ON s.NUOS = os.NUOS
JOIN TGFVEI v ON os.CODVEICULO = v.CODVEICULO
WHERE s.CODPROD = @CODPROD
  AND v.PLACA IS NOT NULL AND RTRIM(v.PLACA) <> ''
GROUP BY v.PLACA, v.MARCAMODELO
ORDER BY qtdOS DESC
`;

export const gruposProduto = `
SELECT g.CODGRUPOPROD, RTRIM(g.DESCRGRUPOPROD) as nome, COUNT(*) as qtd
FROM TGFPRO p
JOIN TGFGRU g ON p.CODGRUPOPROD = g.CODGRUPOPROD
WHERE p.ATIVO = 'S'
GROUP BY g.CODGRUPOPROD, g.DESCRGRUPOPROD
HAVING COUNT(*) >= 10
ORDER BY COUNT(*) DESC
`;
