export const historicoOsUnificado = `
SELECT TOP 100 * FROM (
    SELECT
        'COMERCIAL' AS tipoOs,
        o.NUMOS AS numOs,
        o.DHCHAMADA AS dataInicio,
        o.DTFECHAMENTO AS dataFim,
        o.SITUACAO AS situacao,
        CAST(ISNULL(o.CIDADE, '') AS VARCHAR(200)) AS local,
        'OS Comercial' AS descricao,
        CAST(ISNULL(p.RAZAOSOCIAL, '') AS VARCHAR(200)) AS parceiro,
        COUNT(i.NUMITEM) AS qtdItens
    FROM SANKHYA.TCSOSE o
    INNER JOIN SANKHYA.TCSITE i ON i.NUMOS = o.NUMOS
    LEFT JOIN SANKHYA.TGFPAR p ON p.CODPARC = o.CODPARC
    WHERE i.AD_CODVEICULO = @codveiculo
    GROUP BY o.NUMOS, o.DHCHAMADA, o.DTFECHAMENTO,
      o.SITUACAO, o.CIDADE, p.RAZAOSOCIAL

    UNION ALL

    SELECT
        'MANUTENCAO' AS tipoOs,
        m.NUOS AS numOs,
        m.DATAINI AS dataInicio,
        m.DATAFIN AS dataFim,
        m.STATUS AS situacao,
        'Oficina' AS local,
        CASE m.MANUTENCAO
            WHEN 'C' THEN 'Corretiva'
            WHEN 'P' THEN 'Preventiva'
            WHEN 'R' THEN 'Reforma'
            WHEN 'S' THEN 'Socorro'
            WHEN 'T' THEN 'Retorno'
            WHEN 'O' THEN 'Outros'
            ELSE ISNULL(m.MANUTENCAO, 'Manutencao')
        END AS descricao,
        CAST(ISNULL(p.RAZAOSOCIAL, '') AS VARCHAR(200)) AS parceiro,
        1 AS qtdItens
    FROM SANKHYA.TCFOSCAB m
    LEFT JOIN SANKHYA.TGFPAR p ON p.CODPARC = m.CODPARC
    WHERE m.CODVEICULO = @codveiculo
) AS Historico
ORDER BY dataInicio DESC
`;
