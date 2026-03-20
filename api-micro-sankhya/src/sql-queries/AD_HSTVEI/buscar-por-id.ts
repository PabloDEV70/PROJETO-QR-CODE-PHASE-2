export const buscarPorId = `
SELECT
  h.ID, h.CODVEICULO, h.IDSIT, h.IDPRI,
  h.DESCRICAO, h.OBS,
  h.DTINICIO, h.DTPREVISAO, h.DTFIM,
  h.NUNOTA, h.NUOS, h.NUMOS,
  h.CODPARC, h.EXEOPE, h.EXEMEC,
  h.CODUSUINC, h.CODUSUALT,
  h.DTCRIACAO, h.DTALTER,
  v.PLACA AS placa,
  CAST(v.MARCAMODELO AS VARCHAR(200)) AS marcaModelo,
  v.AD_TAG AS veiculoTag,
  CAST(ISNULL(v.AD_TIPOEQPTO, v.CATEGORIA) AS VARCHAR(100)) AS veiculoTipo,
  CAST(ISNULL(v.AD_CAPACIDADE, '') AS VARCHAR(100)) AS veiculoCapacidade,
  CAST(ISNULL(v.AD_FABRICANTE, '') AS VARCHAR(100)) AS veiculoFabricante,
  v.ATIVO AS veiculoAtivo,
  s.DESCRICAO AS situacaoDescricao,
  s.CODDEP AS situacaoCoddep,
  dep.DESCRDEP AS departamentoNome,
  p.SIGLA AS prioridadeSigla,
  p.DESCRICAO AS prioridadeDescricao,
  par.NOMEPARC AS nomeParc,
  uinc.NOMEUSU AS nomeUsuInc,
  ualt.NOMEUSU AS nomeUsuAlt,
  os.STATUS AS osStatus,
  os.AD_STATUSGIG AS osStatusGig,
  os.TIPO AS osTipo,
  os.MANUTENCAO AS osManutencao,
  os.KM AS osKm,
  os.HORIMETRO AS osHorimetro,
  os.AD_LOCALMANUTENCAO AS osLocalManutencao,
  os.AD_BLOQUEIOS AS osBloqueios,
  os.DTABERTURA AS osDtAbertura,
  mos.SITUACAO AS mosSituacao,
  mosp.NOMEPARC AS mosCliente,
  mosu.NOMEUSU AS mosAtendente,
  mos.NUMCONTRATO AS mosContrato,
  mos.DTPREVISTA AS mosDtPrevista
FROM AD_HSTVEI h
INNER JOIN TGFVEI v ON v.CODVEICULO = h.CODVEICULO
INNER JOIN AD_ADHSTVEISIT s ON s.ID = h.IDSIT
LEFT JOIN TFPDEP dep ON dep.CODDEP = s.CODDEP
LEFT JOIN AD_ADHSTVEIPRI p ON p.IDPRI = h.IDPRI
LEFT JOIN TGFPAR par ON par.CODPARC = h.CODPARC
LEFT JOIN TSIUSU uinc ON uinc.CODUSU = h.CODUSUINC
LEFT JOIN TSIUSU ualt ON ualt.CODUSU = h.CODUSUALT
LEFT JOIN TCFOSCAB os ON os.NUOS = h.NUOS
LEFT JOIN TCSOSE mos ON mos.NUMOS = h.NUMOS
LEFT JOIN TGFPAR mosp ON mosp.CODPARC = mos.CODPARC
LEFT JOIN TSIUSU mosu ON mosu.CODUSU = mos.CODATEND
WHERE h.ID = @id
`;
