export const detalhes = `
SELECT
  det.CODRDO,
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
  aps1.DESCRITIVO as apontamentoDesc,
  aps1.CODPROD as apontamentoCodProd,
  aps1.DESCRPROD as apontamentoProdDesc,
  aps1.HR as apontamentoHr
FROM AD_RDOAPONDETALHES det
LEFT JOIN AD_RDOMOTIVOS mot ON det.RDOMOTIVOCOD = mot.RDOMOTIVOCOD
LEFT JOIN TCFOSCAB os ON det.NUOS = os.NUOS
LEFT JOIN TGFVEI v ON os.CODVEICULO = v.CODVEICULO
OUTER APPLY (
  SELECT TOP 1
    aps.CODIGO,
    aps.SEQ,
    aps.DESCRITIVO,
    aps.CODPROD,
    aps.HR,
    p.DESCRPROD
  FROM AD_APONTSOL aps
  LEFT JOIN TGFPRO p ON aps.CODPROD = p.CODPROD
  WHERE aps.NUOS = det.NUOS
  ORDER BY aps.SEQ
) aps1
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
    AND (det.AD_SEQUENCIA_OS IS NULL OR srv.SEQUENCIA = det.AD_SEQUENCIA_OS)
  ORDER BY CASE WHEN det.AD_SEQUENCIA_OS IS NOT NULL AND srv.SEQUENCIA = det.AD_SEQUENCIA_OS THEN 0 ELSE 1 END, srv.SEQUENCIA
) srv1
OUTER APPLY (
  SELECT COUNT(*) as qtdServicos
  FROM TCFSERVOS
  WHERE NUOS = det.NUOS
) osQtd
WHERE det.CODRDO = @codrdo
ORDER BY det.ITEM
`;
