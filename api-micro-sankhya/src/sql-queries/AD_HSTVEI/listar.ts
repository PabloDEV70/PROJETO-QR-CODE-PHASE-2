export const listar = `
SELECT * FROM (
  SELECT
    h.ID, h.CODVEICULO, h.IDSIT, h.IDPRI,
    h.DESCRICAO, h.OBS, h.DTINICIO, h.DTPREVISAO, h.DTFIM,
    h.NUNOTA, h.NUOS, h.NUMOS, h.CODPARC,
    h.EXEOPE, h.EXEMEC, h.CODUSUINC,
    h.DTCRIACAO, h.DTALTER,
    v.PLACA AS placa,
    CAST(v.MARCAMODELO AS VARCHAR(200)) AS marcaModelo,
    v.AD_TAG AS veiculoTag,
    s.DESCRICAO AS situacaoDescricao,
    s.CODDEP AS situacaoCoddep,
    dep.DESCRDEP AS departamentoNome,
    p.SIGLA AS prioridadeSigla,
    p.DESCRICAO AS prioridadeDescricao,
    par.NOMEPARC AS nomeParc,
    uinc.NOMEUSU AS nomeUsuInc,
    ROW_NUMBER() OVER (ORDER BY -- @ORDER) AS RowNum
  FROM AD_HSTVEI h
  INNER JOIN TGFVEI v ON v.CODVEICULO = h.CODVEICULO
  INNER JOIN AD_ADHSTVEISIT s ON s.ID = h.IDSIT
  LEFT JOIN TFPDEP dep ON dep.CODDEP = s.CODDEP
  LEFT JOIN AD_ADHSTVEIPRI p ON p.IDPRI = h.IDPRI
  LEFT JOIN TGFPAR par ON par.CODPARC = h.CODPARC
  LEFT JOIN TSIUSU uinc ON uinc.CODUSU = h.CODUSUINC
  WHERE 1=1
  -- @WHERE
) AS T
WHERE RowNum > @OFFSET AND RowNum <= (@OFFSET + @LIMIT)
`;

export const listarCount = `
SELECT COUNT(*) AS totalRegistros
FROM AD_HSTVEI h
INNER JOIN AD_ADHSTVEISIT s ON s.ID = h.IDSIT
INNER JOIN TGFVEI v ON v.CODVEICULO = h.CODVEICULO
WHERE 1=1
-- @WHERE
`;
