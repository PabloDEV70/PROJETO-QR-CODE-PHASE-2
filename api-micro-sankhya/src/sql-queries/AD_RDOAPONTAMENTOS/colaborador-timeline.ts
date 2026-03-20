/**
 * Query para timeline de atividades de um colaborador com dados de OS e veículo
 */
export const colaboradorTimeline = `
SELECT
  rdo.CODRDO AS codrdo,
  CONVERT(VARCHAR(10), rdo.DTREF, 23) AS dtref,
  DATEPART(dw, rdo.DTREF) AS diasem,
  det.ITEM AS item,
  det.HRINI AS hrini,
  det.HRFIM AS hrfim,
  CASE WHEN det.HRFIM > det.HRINI AND det.HRFIM <= 2400 THEN
    ((det.HRFIM / 100) * 60 + (det.HRFIM % 100)) -
    ((det.HRINI / 100) * 60 + (det.HRINI % 100))
  ELSE 0 END AS duracaoMinutos,
  det.RDOMOTIVOCOD AS rdomotivocod,
  mot.DESCRICAO AS motivoDescricao,
  mot.SIGLA AS motivoSigla,
  det.NUOS AS nuos,
  os.STATUS AS osStatus,
  vei.PLACA AS veiculoPlaca,
  vei.MARCAMODELO AS veiculoModelo,
  det.OBS AS obs
FROM AD_RDOAPONDETALHES det
INNER JOIN AD_RDOAPONTAMENTOS rdo ON det.CODRDO = rdo.CODRDO
LEFT JOIN AD_RDOMOTIVOS mot ON det.RDOMOTIVOCOD = mot.RDOMOTIVOCOD
LEFT JOIN TCFOSCAB os ON det.NUOS = os.NUOS
LEFT JOIN TGFVEI vei ON os.CODVEICULO = vei.CODVEICULO
WHERE rdo.CODPARC = @codparc
-- @WHERE
ORDER BY rdo.DTREF, det.HRINI
`;

/**
 * Query para buscar dados do colaborador (nome, dept, cargo, etc)
 */
export const colaboradorInfo = `
SELECT TOP 1
  par.CODPARC AS codparc,
  par.NOMEPARC AS nomeparc,
  par.CGC_CPF AS cgcCpf,
  fun.CODDEP AS coddep,
  dep.DESCRDEPTO AS departamento,
  fun.CODCARGO AS codcargo,
  car.DESCRICAO AS cargo,
  fun.CODFUNCAO AS codfuncao,
  fnc.DESCRICAO AS funcao,
  fun.CODEMP AS codemp,
  emp.NOMEFANTASIA AS empresa,
  (SELECT TOP 1 fho.CODCARGAHOR FROM TFPFHO fho
   WHERE fho.CODEMP = fun.CODEMP AND fho.CODFUNC = fun.CODFUNC
   ORDER BY fho.DTINIESCALA DESC) AS codcargahor
FROM TGFPAR par
LEFT JOIN TFPFUN fun ON par.CODPARC = fun.CODPARC AND fun.DTDEM IS NULL
LEFT JOIN TFPDEP dep ON fun.CODDEP = dep.CODDEP AND fun.CODEMP = dep.CODEMP
LEFT JOIN TFPCAR car ON fun.CODCARGO = car.CODCARGO
LEFT JOIN TFPFNC fnc ON fun.CODFUNCAO = fnc.CODFUNCAO
LEFT JOIN TSIEMP emp ON fun.CODEMP = emp.CODEMP
WHERE par.CODPARC = @codparc
`;

/**
 * Query para buscar carga horária do colaborador (horários de cada dia)
 */
export const colaboradorCargaHoraria = `
SELECT
  DIASEM AS diasem,
  HRENT1 AS hrent1,
  HRSAI1 AS hrsai1,
  HRENT2 AS hrent2,
  HRSAI2 AS hrsai2,
  CASE WHEN FOLGA = 1 THEN 1 ELSE 0 END AS folga,
  CASE
    WHEN FOLGA = 1 THEN 0
    ELSE (
      CASE WHEN HRSAI1 > HRENT1 THEN
        ((HRSAI1 / 100) * 60 + (HRSAI1 % 100)) - ((HRENT1 / 100) * 60 + (HRENT1 % 100))
      ELSE 0 END
      +
      CASE WHEN HRSAI2 > HRENT2 THEN
        ((HRSAI2 / 100) * 60 + (HRSAI2 % 100)) - ((HRENT2 / 100) * 60 + (HRENT2 % 100))
      ELSE 0 END
    )
  END AS minutosDia
FROM TFPHOR
WHERE CODCARGAHOR = @codcargahor
ORDER BY DIASEM
`;
