export const osColabServicos = `
SELECT
  os.NUOS,
  os.DTABERTURA,
  os.STATUS,
  CASE os.STATUS
    WHEN 'A' THEN 'Aberta'
    WHEN 'E' THEN 'Em Execucao'
    WHEN 'F' THEN 'Finalizada'
    WHEN 'C' THEN 'Cancelada'
    WHEN 'R' THEN 'Rejeitada'
    ELSE os.STATUS
  END as statusLabel,
  os.TIPO,
  CASE os.TIPO
    WHEN 'I' THEN 'Interna'
    WHEN 'E' THEN 'Externa'
    ELSE os.TIPO
  END as tipoLabel,
  os.MANUTENCAO,
  CASE os.MANUTENCAO
    WHEN 'C' THEN 'Corretiva'
    WHEN 'P' THEN 'Preventiva'
    WHEN 'O' THEN 'Outros'
    WHEN 'S' THEN 'Socorro'
    WHEN 'R' THEN 'Reforma'
    WHEN 'T' THEN 'Retorno'
    WHEN '1' THEN 'Revisao Garantia'
    WHEN '2' THEN 'Corretiva Prog.'
    WHEN '3' THEN 'Inventariado'
    WHEN '4' THEN 'Logistica'
    WHEN '5' THEN 'Borracharia'
    ELSE os.MANUTENCAO
  END as manutencaoLabel,
  os.AD_LOCALMANUTENCAO as localManutencao,
  CASE os.AD_LOCALMANUTENCAO
    WHEN '1' THEN 'Interno'
    WHEN '2' THEN 'Externo'
    WHEN '3' THEN 'Campo'
    ELSE os.AD_LOCALMANUTENCAO
  END as localManutencaoLabel,
  CAST(v.MARCAMODELO AS VARCHAR(MAX)) as marcaModelo,
  v.PLACA as placa,
  srv.SEQUENCIA as sequencia,
  pro.DESCRPROD as nomeServico,
  ato.DHINI as dtInicio,
  ato.DHFIN as dtFim,
  ISNULL(DATEDIFF(MINUTE, ato.DHINI, ato.DHFIN), 0) as tempoGastoMin,
  uexec.NOMEUSU as nomeExecutor,
  uexec.CODPARC as codparcExec,
  rdoLink.CODRDO as codrdoVinculado
FROM TCFSERVOSATO ato
INNER JOIN TCFSERVOS srv ON ato.NUOS = srv.NUOS AND ato.SEQUENCIA = srv.SEQUENCIA
INNER JOIN TCFOSCAB os ON srv.NUOS = os.NUOS
LEFT JOIN TGFPRO pro ON srv.CODPROD = pro.CODPROD
LEFT JOIN TGFVEI v ON os.CODVEICULO = v.CODVEICULO
LEFT JOIN TSIUSU uexec ON ato.CODEXEC = uexec.CODUSU
LEFT JOIN (
  SELECT det.NUOS, rdo.CODPARC, MAX(rdo.CODRDO) as CODRDO
  FROM AD_RDOAPONDETALHES det
  INNER JOIN AD_RDOAPONTAMENTOS rdo ON det.CODRDO = rdo.CODRDO
  WHERE det.NUOS IS NOT NULL
  GROUP BY det.NUOS, rdo.CODPARC
) rdoLink ON rdoLink.NUOS = os.NUOS AND rdoLink.CODPARC = uexec.CODPARC
WHERE 1=1
-- @EXEC_FILTER
-- @WHERE
ORDER BY ato.DHINI DESC
`;
