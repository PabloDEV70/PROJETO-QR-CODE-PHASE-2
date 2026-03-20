export const detalhesPorPeriodo = `
SELECT * FROM (
  SELECT
    rdo.CODRDO,
    CONVERT(VARCHAR(10), rdo.DTREF, 23) AS DTREF,
    rdo.CODPARC,
    parc.NOMEPARC as nomeparc,
    parc.CGC_CPF as cgc_cpf,
    det.ITEM,
    det.HRINI,
    det.HRFIM,
    RIGHT('0' + CAST(det.HRINI / 100 AS VARCHAR), 2) + ':' + RIGHT('0' + CAST(det.HRINI % 100 AS VARCHAR), 2) as hriniFormatada,
    RIGHT('0' + CAST(det.HRFIM / 100 AS VARCHAR), 2) + ':' + RIGHT('0' + CAST(det.HRFIM % 100 AS VARCHAR), 2) as hrfimFormatada,
    CASE WHEN det.HRFIM > det.HRINI AND det.HRFIM <= 2400 THEN
      ((det.HRFIM / 100) * 60 + (det.HRFIM % 100)) -
      ((det.HRINI / 100) * 60 + (det.HRINI % 100))
    ELSE 0 END as duracaoMinutos,
    det.RDOMOTIVOCOD,
    mot.DESCRICAO as motivoDescricao,
    mot.SIGLA as motivoSigla,
    mot.PRODUTIVO as motivoProdutivo,
    mot.WTCATEGORIA as motivoCategoria,
    det.NUOS,
    os.STATUS as osStatus,
    v.PLACA as veiculoPlaca,
    v.MARCAMODELO as veiculoModelo,
    det.OBS,
    srv1.CODPROD as servicoCodProd,
    srv1.nomeProduto as servicoNome,
    srv1.OBSERVACAO as servicoObs,
    srv1.TEMPO as servicoTempo,
    srv1.servicoStatus as servicoStatus,
    osQtd.qtdServicos as osQtdServicos,
    fun.CODDEP as coddep,
    dep.DESCRDEP as departamento,
    fun.CODCARGO as codcargo,
    car.DESCRCARGO as cargo,
    fun.CODFUNCAO as codfuncao,
    fco.DESCRFUNCAO as funcao,
    fun.CODEMP as codemp,
    emp.NOMEFANTASIA as empresa,
    ROW_NUMBER() OVER (ORDER BY -- @ORDER) AS RowNum
  FROM AD_RDOAPONDETALHES det
  INNER JOIN AD_RDOAPONTAMENTOS rdo ON det.CODRDO = rdo.CODRDO
  LEFT JOIN TGFPAR parc ON rdo.CODPARC = parc.CODPARC
  LEFT JOIN (
    SELECT CODPARC, CODDEP, CODCARGO, CODFUNCAO, CODEMP,
      ROW_NUMBER() OVER (PARTITION BY CODPARC ORDER BY DTADM DESC) as rn
    FROM TFPFUN
    WHERE SITUACAO = '1'
  ) fun ON parc.CODPARC = fun.CODPARC AND fun.rn = 1
  LEFT JOIN TFPCAR car ON fun.CODCARGO = car.CODCARGO
  LEFT JOIN TFPFCO fco ON fun.CODFUNCAO = fco.CODFUNCAO
  LEFT JOIN TFPDEP dep ON fun.CODDEP = dep.CODDEP
  LEFT JOIN TSIEMP emp ON fun.CODEMP = emp.CODEMP
  LEFT JOIN AD_RDOMOTIVOS mot ON det.RDOMOTIVOCOD = mot.RDOMOTIVOCOD
  LEFT JOIN TCFOSCAB os ON det.NUOS = os.NUOS
  LEFT JOIN TGFVEI v ON os.CODVEICULO = v.CODVEICULO
  OUTER APPLY (
    SELECT TOP 1
      srv.CODPROD,
      p.DESCRPROD as nomeProduto,
      srv.OBSERVACAO,
      srv.TEMPO,
      srv.STATUS as servicoStatus
    FROM TCFSERVOS srv
    LEFT JOIN TGFPRO p ON srv.CODPROD = p.CODPROD
    WHERE srv.NUOS = det.NUOS
    ORDER BY srv.SEQUENCIA
  ) srv1
  OUTER APPLY (
    SELECT COUNT(*) as qtdServicos
    FROM TCFSERVOS
    WHERE NUOS = det.NUOS
  ) osQtd
  WHERE 1=1
  -- @WHERE
) AS T
WHERE RowNum > @OFFSET AND RowNum <= (@OFFSET + @LIMIT)
`;
