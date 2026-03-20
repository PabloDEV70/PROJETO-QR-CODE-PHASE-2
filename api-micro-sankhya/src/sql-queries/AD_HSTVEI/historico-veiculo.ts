export const historicoVeiculo = `
SELECT * FROM (
  SELECT
    h.ID AS id,
    h.IDSIT AS idsit,
    h.IDPRI AS idpri,
    h.DESCRICAO AS descricao,
    h.OBS AS obs,
    h.DTINICIO AS dtinicio,
    h.DTPREVISAO AS dtprevisao,
    h.DTFIM AS dtfim,
    DATEDIFF(MINUTE, h.DTINICIO, ISNULL(h.DTFIM, GETDATE())) AS duracaoMinutos,
    h.NUNOTA AS nunota,
    h.NUOS AS nuos,
    h.NUMOS AS numos,
    h.CODPARC AS codparc,
    h.EXEOPE AS exeope,
    h.EXEMEC AS exemec,
    s.DESCRICAO AS situacao,
    s.CODDEP AS situacaoCoddep,
    dep.DESCRDEP AS departamento,
    p.SIGLA AS prioridadeSigla,
    par.NOMEPARC AS nomeParc,
    uinc.NOMEUSU AS nomeUsuInc,
    ualt.NOMEUSU AS nomeUsuAlt,
    ROW_NUMBER() OVER (ORDER BY h.DTINICIO DESC) AS RowNum
  FROM AD_HSTVEI h
  INNER JOIN AD_ADHSTVEISIT s ON s.ID = h.IDSIT
  LEFT JOIN TFPDEP dep ON dep.CODDEP = s.CODDEP
  LEFT JOIN AD_ADHSTVEIPRI p ON p.IDPRI = h.IDPRI
  LEFT JOIN TGFPAR par ON par.CODPARC = h.CODPARC
  LEFT JOIN TSIUSU uinc ON uinc.CODUSU = h.CODUSUINC
  LEFT JOIN TSIUSU ualt ON ualt.CODUSU = h.CODUSUALT
  WHERE h.CODVEICULO = @codveiculo
) AS T
WHERE RowNum > @OFFSET AND RowNum <= (@OFFSET + @LIMIT)
`;

export const historicoVeiculoCount = `
SELECT COUNT(*) AS totalRegistros
FROM AD_HSTVEI h
WHERE h.CODVEICULO = @codveiculo
`;
