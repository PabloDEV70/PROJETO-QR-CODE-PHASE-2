export const ativasPorVeiculo = `
SELECT
  h.ID, h.CODVEICULO, h.IDSIT, h.IDPRI,
  h.DESCRICAO, h.OBS,
  h.DTINICIO, h.DTPREVISAO,
  h.NUNOTA, h.NUOS, h.NUMOS,
  h.CODPARC, h.EXEOPE, h.EXEMEC,
  h.CODUSUINC,
  s.DESCRICAO AS situacaoDescricao,
  s.CODDEP AS situacaoCoddep,
  dep.DESCRDEP AS departamentoNome,
  p.SIGLA AS prioridadeSigla,
  p.DESCRICAO AS prioridadeDescricao,
  par.NOMEPARC AS nomeParc,
  uinc.NOMEUSU AS nomeUsuInc,
  uinc.CODPARC AS codparcUsuInc,
  os.STATUS AS osStatus,
  os.TIPO AS osTipo,
  mos.SITUACAO AS mosSituacao,
  mosp.NOMEPARC AS mosCliente
FROM AD_HSTVEI h
INNER JOIN AD_ADHSTVEISIT s ON s.ID = h.IDSIT
LEFT JOIN TFPDEP dep ON dep.CODDEP = s.CODDEP
LEFT JOIN AD_ADHSTVEIPRI p ON p.IDPRI = h.IDPRI
LEFT JOIN TGFPAR par ON par.CODPARC = h.CODPARC
LEFT JOIN TSIUSU uinc ON uinc.CODUSU = h.CODUSUINC
LEFT JOIN TCFOSCAB os ON os.NUOS = h.NUOS
LEFT JOIN TCSOSE mos ON mos.NUMOS = h.NUMOS
LEFT JOIN TGFPAR mosp ON mosp.CODPARC = mos.CODPARC
WHERE h.DTFIM IS NULL AND h.CODVEICULO = @codveiculo
ORDER BY ISNULL(h.IDPRI, 99), h.DTPREVISAO
`;
