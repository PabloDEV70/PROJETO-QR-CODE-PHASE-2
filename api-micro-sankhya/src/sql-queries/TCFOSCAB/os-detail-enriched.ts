export const osDetailEnriched = `
SELECT
  os.NUOS,
  os.DTABERTURA,
  os.DATAFIN,
  os.DATAINI,
  os.PREVISAO,
  os.DHALTER,
  os.STATUS,
  os.TIPO,
  os.MANUTENCAO,
  os.CODVEICULO,
  os.HORIMETRO,
  os.KM,
  os.CODEMP,
  os.NUPLANO,
  os.AD_STATUSGIG,
  os.AD_FINALIZACAO,
  os.AD_LOCALMANUTENCAO,
  os.AD_BLOQUEIOS,
  os.AD_OSORIGEM,
  os.CODPARC,
  os.CODMOTORISTA,
  CASE os.STATUS
    WHEN 'A' THEN 'Aberta'
    WHEN 'E' THEN 'Em Execucao'
    WHEN 'F' THEN 'Finalizada'
    WHEN 'C' THEN 'Cancelada'
    WHEN 'R' THEN 'Reaberta'
    ELSE os.STATUS
  END AS statusLabel,
  CASE os.MANUTENCAO
    WHEN 'C' THEN 'Corretiva'
    WHEN 'P' THEN 'Preventiva'
    WHEN 'O' THEN 'Outros'
    WHEN 'S' THEN 'Socorro'
    WHEN 'R' THEN 'Reforma'
    WHEN 'T' THEN 'Retorno'
    WHEN '1' THEN 'Rev. Garantia'
    WHEN '2' THEN 'Corretiva Prog.'
    WHEN '3' THEN 'Inventariado'
    WHEN '4' THEN 'Logistica'
    WHEN '5' THEN 'Borracharia'
    ELSE os.MANUTENCAO
  END AS manutencaoLabel,
  CASE os.TIPO
    WHEN 'I' THEN 'Interna'
    WHEN 'E' THEN 'Externa'
    ELSE os.TIPO
  END AS tipoLabel,
  CASE os.AD_LOCALMANUTENCAO
    WHEN '1' THEN 'Oficina'
    WHEN '2' THEN 'Campo'
    WHEN '3' THEN 'Terceiro'
    ELSE os.AD_LOCALMANUTENCAO
  END AS localLabel,
  CASE os.AD_FINALIZACAO
    WHEN 'LF' THEN 'Liberado Funcionamento'
    WHEN 'LT' THEN 'Liberado c/ Restricao'
    WHEN 'LD' THEN 'Liberado c/ Defeito'
    ELSE os.AD_FINALIZACAO
  END AS finalizacaoLabel,
  (SELECT COUNT(*) FROM TCFSERVOS srv WHERE srv.NUOS = os.NUOS) AS totalServicos,
  (SELECT SUM(ISNULL(srv.VLRTOT, 0)) FROM TCFSERVOS srv WHERE srv.NUOS = os.NUOS) AS custoTotal,
  CAST(v.MARCAMODELO AS VARCHAR(200)) AS veiculoMarca,
  v.PLACA AS veiculoPlaca,
  v.AD_TAG AS veiculoTag,
  v.AD_TIPOEQPTO AS veiculoTipo,
  uinc.NOMEUSU AS nomeUsuInc,
  ualter.NOMEUSU AS nomeUsuAlter,
  ufin.NOMEUSU AS nomeUsuFin
FROM TCFOSCAB os
LEFT JOIN TGFVEI v ON os.CODVEICULO = v.CODVEICULO
LEFT JOIN TGFPAR p ON os.CODPARC = p.CODPARC
LEFT JOIN TSIUSU uinc ON os.CODUSUINC = uinc.CODUSU
LEFT JOIN TSIUSU ualter ON os.AD_CODUSUALTER = ualter.CODUSU
LEFT JOIN TSIUSU ufin ON os.CODUSUFINALIZA = ufin.CODUSU
WHERE os.NUOS = @nuos
`;

export const osExecutores = `
SELECT
  ex.NUOS,
  ex.SEQUENCIA,
  COALESCE(ex.CODUSUEXEC, ex.CODUSU) AS codusu,
  uexec.CODPARC AS codparc,
  uexec.NOMEUSU AS nomeUsuario,
  RTRIM(par.NOMEPARC) AS nomeColaborador,
  CONVERT(VARCHAR(19), ex.DTINI, 120) AS dtIni,
  CONVERT(VARCHAR(19), ex.DTFIN, 120) AS dtFin,
  DATEDIFF(MINUTE, ex.DTINI, ex.DTFIN) AS minutos,
  CAST(ex.OBS AS VARCHAR(500)) AS obs
FROM AD_TCFEXEC ex
LEFT JOIN TSIUSU uexec ON COALESCE(ex.CODUSUEXEC, ex.CODUSU) = uexec.CODUSU
LEFT JOIN TGFPAR par ON uexec.CODPARC = par.CODPARC
WHERE ex.NUOS = @nuos
ORDER BY ex.SEQUENCIA, ex.DTINI
`;
