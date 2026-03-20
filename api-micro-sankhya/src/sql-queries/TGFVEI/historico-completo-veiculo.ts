export const historicoCompletoVeiculo = `
SELECT TOP 200
  x.tipo, x.numOs, x.status, x.dataEvento, x.dataFim,
  x.codUsuario, x.nomeUsuario, x.codparcUsuario,
  x.codUsuario2, x.nomeUsuario2, x.codparcUsuario2,
  x.cliente, x.codparc, x.descricao,
  x.qtdDiarias, x.tipoManut, x.subtipo, x.km
FROM (
  SELECT
    'MANUTENCAO' AS tipo,
    m.NUOS AS numOs,
    m.STATUS AS status,
    CONVERT(VARCHAR, m.DATAINI, 120) AS dataEvento,
    CONVERT(VARCHAR, m.DATAFIN, 120) AS dataFim,
    m.CODUSUINC AS codUsuario,
    CAST(ISNULL(uInc.NOMEUSU, '') AS VARCHAR(100)) AS nomeUsuario,
    uInc.CODPARC AS codparcUsuario,
    m.CODUSUFINALIZA AS codUsuario2,
    CAST(ISNULL(uFin.NOMEUSU, '') AS VARCHAR(100)) AS nomeUsuario2,
    uFin.CODPARC AS codparcUsuario2,
    '' AS cliente,
    0 AS codparc,
    '' AS descricao,
    0 AS qtdDiarias,
    CAST(ISNULL(m.MANUTENCAO, '') AS VARCHAR(5)) AS tipoManut,
    CAST(ISNULL(m.TIPO, '') AS VARCHAR(5)) AS subtipo,
    m.KM AS km
  FROM SANKHYA.TCFOSCAB m
  LEFT JOIN SANKHYA.TSIUSU uInc ON uInc.CODUSU = m.CODUSUINC
  LEFT JOIN SANKHYA.TSIUSU uFin ON uFin.CODUSU = m.CODUSUFINALIZA
  WHERE m.CODVEICULO = @codveiculo

  UNION ALL

  SELECT
    'COMERCIAL' AS tipo,
    o.NUMOS AS numOs,
    o.SITUACAO AS status,
    CONVERT(VARCHAR, o.DHCHAMADA, 120) AS dataEvento,
    CONVERT(VARCHAR, o.DTFECHAMENTO, 120) AS dataFim,
    o.CODATEND AS codUsuario,
    CAST(ISNULL(uAt.NOMEUSU, '') AS VARCHAR(100)) AS nomeUsuario,
    uAt.CODPARC AS codparcUsuario,
    o.CODUSUFECH AS codUsuario2,
    CAST(ISNULL(uFch.NOMEUSU, '') AS VARCHAR(100)) AS nomeUsuario2,
    uFch.CODPARC AS codparcUsuario2,
    CAST(ISNULL(p.NOMEPARC, '') AS VARCHAR(150)) AS cliente,
    o.CODPARC AS codparc,
    CAST(ISNULL(CAST(o.DESCRICAO AS VARCHAR(200)), '') AS VARCHAR(200)) AS descricao,
    (SELECT COUNT(*) FROM SANKHYA.TCSITE si
      WHERE si.NUMOS = o.NUMOS AND si.AD_CODVEICULO = @codveiculo) AS qtdDiarias,
    '' AS tipoManut,
    '' AS subtipo,
    0 AS km
  FROM SANKHYA.TCSOSE o
  INNER JOIN SANKHYA.TCSITE iv ON iv.NUMOS = o.NUMOS AND iv.AD_CODVEICULO = @codveiculo
  LEFT JOIN SANKHYA.TSIUSU uAt ON uAt.CODUSU = o.CODATEND
  LEFT JOIN SANKHYA.TSIUSU uFch ON uFch.CODUSU = o.CODUSUFECH
  LEFT JOIN SANKHYA.TGFPAR p ON p.CODPARC = o.CODPARC
  GROUP BY o.NUMOS, o.SITUACAO, o.DHCHAMADA, o.DTFECHAMENTO,
    o.CODATEND, uAt.NOMEUSU, uAt.CODPARC,
    o.CODUSUFECH, uFch.NOMEUSU, uFch.CODPARC,
    o.CODPARC, p.NOMEPARC, CAST(o.DESCRICAO AS VARCHAR(200))
) x
ORDER BY x.dataEvento DESC
`;
