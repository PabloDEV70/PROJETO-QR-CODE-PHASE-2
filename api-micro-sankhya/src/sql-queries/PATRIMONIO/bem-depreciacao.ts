export const bemDepreciacao = `
SELECT
    b.CODBEM AS codbem,
    ISNULL(b.VLRAQUISICAO, 0) AS vlrAquisicao,
    ISNULL(b.VLRDEP, 0) AS vlrDepreciacao,
    ISNULL(b.VLRSALDO, 0) AS vlrSaldo,
    CASE WHEN ISNULL(b.VLRAQUISICAO, 0) > 0
      THEN CAST(ISNULL(b.VLRDEP, 0) * 100.0 / b.VLRAQUISICAO AS DECIMAL(5,1))
      ELSE 0
    END AS percentualDepreciado,
    b.TEMDEPRECIACAO AS temDepreciacao,
    b.VIDAUTIL AS vidaUtil,
    CONVERT(VARCHAR(10), b.DTINICIODEP, 103) AS dtInicioDep,
    CONVERT(VARCHAR(10), b.DTFIMDEP, 103) AS dtFimDep,
    CONVERT(VARCHAR(10), b.DTCOMPRA, 103) AS dtCompra,
    b.VLRICMSCIAP AS vlrIcmsCiap,
    b.QTDMESESCIAP AS qtdMesesCiap,
    CONVERT(VARCHAR(10), b.DTINIREFCIAP, 103) AS dtIniRefCiap,
    CONVERT(VARCHAR(10), b.DTFIMREFCIAP, 103) AS dtFimRefCiap,
    ISNULL(b.VLRTOTDESPESABEM, 0) AS vlrTotDespesaBem,
    ISNULL(b.VALORPRESENTE, 0) AS valorPresente,
    ISNULL(b.VLRCOMPRAAQUISICAO, 0) AS vlrCompraAquisicao
FROM SANKHYA.TCIBEM b
WHERE RTRIM(b.CODBEM) = '@codbem' AND (@codprod = 0 OR b.CODPROD = @codprod)
`;
