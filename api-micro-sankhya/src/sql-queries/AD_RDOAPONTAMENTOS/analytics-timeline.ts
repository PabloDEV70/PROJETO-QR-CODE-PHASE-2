/**
 * Timeline diaria — 2 niveis de agregacao.
 * Inner: por (DTREF, CODPARC) — calcula minutos e jornada por colaborador.
 * Outer: por DTREF — agrega e computa hora extra POR COLABORADOR antes de somar,
 *   evitando cancelamento (deficit de um colab mascarando HE de outro).
 * Jornada: TFPFHO (escala atual) + TFPHOR (quadro semanal por DIASEM).
 * Um unico -- @WHERE no inner query (onde aliases rdo/fun/parc existem).
 */
export const analyticsTimeline = `
SELECT
  CONVERT(VARCHAR(10), D.DTREF, 23) AS DTREF,
  SUM(D.colabRdos) as totalRdos,
  COUNT(*) as totalColaboradores,
  SUM(D.colabItens) as totalItens,
  CAST(SUM(D.colabMinutos) / 60.0 AS DECIMAL(10,2)) as totalHoras,
  CAST(SUM(D.colabMinProd) / 60.0 AS DECIMAL(10,2)) as horasProdutivas,
  SUM(D.colabItensOs) as itensComOs,
  SUM(D.colabMinPrevistos) as minutosPrevistos,
  SUM(CASE
    WHEN D.colabMinutos > D.colabMinPrevistos AND D.colabMinPrevistos > 0
    THEN D.colabMinutos - D.colabMinPrevistos ELSE 0
  END) as minutosHoraExtra,
  SUM(CASE
    WHEN D.colabMinutos > D.colabMinPrevistos
      AND D.colabMinPrevistos > 0 AND D.colabMinutos > 0
    THEN CAST(
      (D.colabMinutos - D.colabMinPrevistos)
        * (D.colabMinProd * 1.0 / D.colabMinutos)
      AS INT)
    ELSE 0
  END) as minutosHoraExtraProd
FROM (
  SELECT
    rdo.DTREF,
    rdo.CODPARC,
    COUNT(DISTINCT rdo.CODRDO) as colabRdos,
    COUNT(det.ITEM) as colabItens,
    ISNULL(SUM(CASE WHEN det.HRFIM > det.HRINI AND det.HRFIM <= 2400
      AND det.HRINI >= 600 THEN
      ((det.HRFIM / 100) * 60 + (det.HRFIM % 100)) -
      ((det.HRINI / 100) * 60 + (det.HRINI % 100))
    ELSE 0 END), 0) as colabMinutos,
    ISNULL(SUM(CASE WHEN mot.WTCATEGORIA = 'wrenchTime'
      AND det.HRFIM > det.HRINI AND det.HRFIM <= 2400
      AND det.HRINI >= 600 THEN
      ((det.HRFIM / 100) * 60 + (det.HRFIM % 100)) -
      ((det.HRINI / 100) * 60 + (det.HRINI % 100))
    ELSE 0 END), 0) as colabMinProd,
    SUM(CASE WHEN det.NUOS IS NOT NULL THEN 1 ELSE 0 END) as colabItensOs,
    ISNULL(hor.minutosDia, 0) as colabMinPrevistos
  FROM AD_RDOAPONTAMENTOS rdo
  LEFT JOIN AD_RDOAPONDETALHES det ON rdo.CODRDO = det.CODRDO
  LEFT JOIN AD_RDOMOTIVOS mot ON det.RDOMOTIVOCOD = mot.RDOMOTIVOCOD
  LEFT JOIN TGFPAR parc ON rdo.CODPARC = parc.CODPARC
  LEFT JOIN (
    SELECT f.CODPARC, f.CODDEP, f.CODCARGO, f.CODFUNCAO, f.CODEMP,
      (SELECT TOP 1 fho.CODCARGAHOR FROM TFPFHO fho
       WHERE fho.CODEMP = f.CODEMP AND fho.CODFUNC = f.CODFUNC
       ORDER BY fho.DTINIESCALA DESC) AS CODCARGAHOR,
      ROW_NUMBER() OVER (PARTITION BY f.CODPARC ORDER BY f.DTADM DESC) as rn
    FROM TFPFUN f WHERE f.SITUACAO = '1'
  ) fun ON parc.CODPARC = fun.CODPARC AND fun.rn = 1
  LEFT JOIN (
    SELECT CODCARGAHOR, DIASEM,
      SUM(CASE WHEN ENTRADA IS NOT NULL AND SAIDA IS NOT NULL THEN
        ((SAIDA / 100) * 60 + (SAIDA % 100)) -
        ((ENTRADA / 100) * 60 + (ENTRADA % 100))
      ELSE 0 END) as minutosDia
    FROM TFPHOR
    GROUP BY CODCARGAHOR, DIASEM
  ) hor ON hor.CODCARGAHOR = fun.CODCARGAHOR
    AND hor.DIASEM = DATEPART(WEEKDAY, rdo.DTREF)
  WHERE 1=1
  -- @WHERE
  GROUP BY rdo.DTREF, rdo.CODPARC, hor.minutosDia
) D
GROUP BY D.DTREF
ORDER BY D.DTREF ASC
`;
