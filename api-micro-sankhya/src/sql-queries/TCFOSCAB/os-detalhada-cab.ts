export const osDetalhadaCab = `
SELECT
    cab.NUOS,
    cab.CODVEICULO,
    v.PLACA,
    CAST(v.MARCAMODELO AS VARCHAR(200)) AS VEICULO,
    cab.STATUS,
    CASE cab.STATUS
        WHEN 'A' THEN 'Aberta'
        WHEN 'E' THEN 'Em Execucao'
        WHEN 'F' THEN 'Finalizada'
        WHEN 'C' THEN 'Cancelada'
        ELSE cab.STATUS
    END AS STATUS_DESCRICAO,
    cab.TIPO,
    CASE cab.TIPO
        WHEN 'I' THEN 'Interna'
        WHEN 'E' THEN 'Externa'
        ELSE cab.TIPO
    END AS TIPO_DESCRICAO,
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
    cab.DATAFIN,
    cab.KM,
    cab.HORIMETRO,
    cab.CODEMP,
    cab.CODPARC,
    CAST(ISNULL(p.RAZAOSOCIAL, '') AS VARCHAR(200)) AS PARCEIRO_NOME,
    cab.DTABERTURA,
    CAST(ISNULL(u.NOMEUSU, '') AS VARCHAR(200)) AS USUARIO_ABERTURA,
    RTRIM(CAST(ISNULL(cab.AD_LOCALMANUTENCAO, '') AS VARCHAR(50))) AS AD_LOCALMANUTENCAO,
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
    END AS AD_BLOQUEIOS_DESCRICAO,
    (SELECT COUNT(*) FROM SANKHYA.TCFSERVOS s WHERE s.NUOS = cab.NUOS) AS TOTAL_SERVICOS,
    (SELECT COUNT(*) FROM SANKHYA.TCFSERVOS s WHERE s.NUOS = cab.NUOS AND s.STATUS = 'E') AS SERVICOS_EM_EXEC,
    (SELECT COUNT(*) FROM SANKHYA.TCFSERVOS s WHERE s.NUOS = cab.NUOS AND s.STATUS = 'F') AS SERVICOS_FINALIZADOS
FROM SANKHYA.TCFOSCAB cab
LEFT JOIN SANKHYA.TGFVEI v ON v.CODVEICULO = cab.CODVEICULO
LEFT JOIN SANKHYA.TGFPAR p ON p.CODPARC = cab.CODPARC
LEFT JOIN SANKHYA.TSIUSU u ON u.CODUSU = cab.CODUSU
WHERE cab.NUOS = @nuos
`;
