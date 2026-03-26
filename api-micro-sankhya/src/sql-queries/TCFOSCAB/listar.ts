export const listar = `
SELECT * FROM (
  SELECT
    os.NUOS,
    os.NUPLANO,
    os.NUNOTA,
    os.MANUTENCAO,
    os.TIPO,
    os.OSMANUAL,
    os.AUTOMATICO,
    os.CODVEICULO,
    os.CODPARC,
    os.CODPROD,
    os.CODBEM,
    os.CODMOTORISTA,
    os.CODNAT,
    os.CODPROJ,
    os.STATUS,
    os.AD_STATUSGIG,
    os.AD_FINALIZACAO,
    os.AD_LOCALMANUTENCAO,
    os.AD_BLOQUEIOS,
    os.AD_EXIBEDASH,
    os.DTABERTURA,
    os.DATAINI,
    os.DATAFIN,
    os.PREVISAO,
    os.DHALTER,
    os.HORIMETRO,
    os.KM,
    os.CODEMP,
    os.CODEMPNEGOC,
    os.CODCENCUS,
    os.CODUSU,
    os.CODUSUINC,
    os.CODUSUFINALIZA,
    os.CODUSUREABRE,
    os.AD_DATAFINAL,
    os.AD_NUNOTASOLCOMPRA,
    os.AD_NUMCONTRATO,
    os.AD_DHALTERSTATUS,
    os.AD_EXISBEDASH,
    os.AD_DTFIMPLAN,
    os.AD_DTINIPLAN,
    os.AD_OSORIGEM,
    os.AD_DTPLANEJA,
    os.AD_CODUSUALTER,
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
    END as manutencaoLabel,
    (
      SELECT COUNT(*)
      FROM TCFSERVOS srv
      WHERE srv.NUOS = os.NUOS
    ) as totalServicos,
    (
      SELECT TOP 1 CAST(se.DESCRICAO AS VARCHAR(300))
      FROM TCSOSE se
      WHERE se.NUMOS = os.NUOS
    ) as OBSERVACAO,
    ROW_NUMBER() OVER (ORDER BY -- @ORDER) AS RowNum
  FROM TCFOSCAB os
  LEFT JOIN TGFVEI v ON os.CODVEICULO = v.CODVEICULO
  LEFT JOIN TGFPAR p ON os.CODPARC = p.CODPARC
  WHERE 1=1
  -- @WHERE
) AS T
WHERE RowNum > @OFFSET AND RowNum <= (@OFFSET + @LIMIT)
`;
