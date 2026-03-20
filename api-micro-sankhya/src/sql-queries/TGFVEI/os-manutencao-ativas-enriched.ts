export const osManutencaoAtivasEnriched = `
SELECT
    cab.NUOS,
    cab.STATUS,
    CASE cab.STATUS
        WHEN 'A' THEN 'Aberta'
        WHEN 'E' THEN 'Em Execucao'
    END AS STATUS_DESCRICAO,
    cab.TIPO,
    cab.MANUTENCAO,
    CASE cab.MANUTENCAO
        WHEN '1' THEN 'Revisao em Garantia'
        WHEN '2' THEN 'Corretiva Programada'
        WHEN '3' THEN 'Inventariado'
        WHEN '4' THEN 'Logistica'
        WHEN '5' THEN 'Borracharia'
        WHEN 'C' THEN 'Corretiva'
        WHEN 'O' THEN 'Outros'
        WHEN 'P' THEN 'Preventiva'
        WHEN 'R' THEN 'Reforma'
        WHEN 'S' THEN 'Socorro'
        WHEN 'T' THEN 'Retorno'
        ELSE cab.MANUTENCAO
    END AS MANUTENCAO_DESCRICAO,
    cab.DATAINI,
    cab.PREVISAO,
    cab.KM,
    cab.HORIMETRO,
    (SELECT COUNT(*) FROM SANKHYA.TCFSERVOS s WHERE s.NUOS = cab.NUOS) AS QTD_SERVICOS,
    (SELECT COUNT(*) FROM SANKHYA.TCFSERVOS s WHERE s.NUOS = cab.NUOS AND s.STATUS = 'E') AS SERVICOS_EM_EXEC,
    (SELECT COUNT(*) FROM SANKHYA.TCFSERVOS s WHERE s.NUOS = cab.NUOS AND s.STATUS = 'F') AS SERVICOS_FINALIZADOS,
    (SELECT TOP 1 CAST(p.DESCRPROD AS VARCHAR(200))
     FROM SANKHYA.TCFSERVOS s
     LEFT JOIN SANKHYA.TGFPRO p ON p.CODPROD = s.CODPROD
     WHERE s.NUOS = cab.NUOS AND (s.STATUS = 'E' OR s.STATUS IS NULL)
     ORDER BY s.SEQUENCIA
    ) AS SERVICO_PRINCIPAL,
    RTRIM(CAST(ISNULL(cab.AD_STATUSGIG, '') AS VARCHAR(10))) AS AD_STATUSGIG,
    CASE cab.AD_STATUSGIG
        WHEN 'AI' THEN 'Aguardando Pecas (Impeditivo)'
        WHEN 'AN' THEN 'Aguardando Pecas (Nao impeditivo)'
        WHEN 'AV' THEN 'Avaliacao'
        WHEN 'MA' THEN 'Manutencao'
        WHEN 'SI' THEN 'Servico (Impeditivo)'
        WHEN 'SN' THEN 'Servico de terceiros (Nao impeditivo)'
        ELSE cab.AD_STATUSGIG
    END AS AD_STATUSGIG_DESCRICAO,
    RTRIM(CAST(ISNULL(cab.AD_BLOQUEIOS, '') AS VARCHAR(10))) AS AD_BLOQUEIOS,
    CASE cab.AD_BLOQUEIOS
        WHEN 'S' THEN 'Com Bloqueio Comercial'
        ELSE 'Sem Bloqueio'
    END AS AD_BLOQUEIOS_DESCRICAO
FROM SANKHYA.TCFOSCAB cab
WHERE cab.CODVEICULO = @codveiculo
  AND cab.STATUS IN ('A', 'E')
  AND cab.DATAFIN IS NULL
ORDER BY cab.DATAINI DESC
`;
