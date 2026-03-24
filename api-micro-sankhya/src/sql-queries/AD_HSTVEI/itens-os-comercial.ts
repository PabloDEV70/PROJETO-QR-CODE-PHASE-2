/** Itens da OS Comercial (TCSITE) vinculada a uma situacao via NUMOS */
export const itensOsComercial = `
SELECT
  ite.NUMOS,
  ite.NUMITEM,
  ite.CODSERV,
  serv.DESCRPROD AS servicoDescricao,
  CONVERT(VARCHAR(19), ite.DHPREVISTA, 120) AS dtPrevista,
  ite.TEMPPREVISTO AS tempPrevisto,
  ite.TEMPGASTO AS tempGasto,
  ite.VLRHORAFAT AS vlrHoraFat,
  ite.AD_KMINI AS kmInicial,
  ite.AD_KMFIM AS kmFinal,
  CASE WHEN ite.AD_KMINI IS NOT NULL AND ite.AD_KMFIM IS NOT NULL
    THEN ROUND(ite.AD_KMFIM - ite.AD_KMINI, 2) ELSE NULL END AS kmPercorrido,
  CASE WHEN ite.VLRHORAFAT > 0 AND ite.TEMPGASTO > 0
    THEN ROUND((ite.TEMPGASTO / 60.0) * ite.VLRHORAFAT, 2) ELSE NULL END AS vlrTotalHoras,
  ite.INTERVALO AS intervalo,
  CAST(ite.SOLUCAO AS VARCHAR(1000)) AS solucao,
  ite.CODSIT AS codSitItem,
  sits.DESCRICAO AS statusItem,
  -- Operador (usuario grupo 15)
  CASE WHEN usu.CODGRUPO = 15 THEN usu.NOMEUSU
    ELSE (SELECT u2.NOMEUSU FROM TSIUSU u2
          WHERE u2.CODUSU = (SELECT it2.CODUSU FROM TCSITE it2
            WHERE it2.NUMOS = (SELECT MIN(os2.NUMOS) FROM TCSOSE os2 WHERE os2.NUMOSRELACIONADA = ite.NUMOS)
            AND it2.NUMITEM = ite.NUMITEM)
          AND u2.CODGRUPO = 15)
  END AS nomeOperador,
  -- Veiculo (via usuario grupo 18 → AD_CODVEICULO)
  CASE WHEN usu.CODGRUPO = 18 THEN usu.AD_CODVEICULO
    ELSE (SELECT u3.AD_CODVEICULO FROM TSIUSU u3
          WHERE u3.CODUSU = (SELECT it3.CODUSU FROM TCSITE it3
            WHERE it3.NUMOS = (SELECT MIN(os3.NUMOS) FROM TCSOSE os3 WHERE os3.NUMOSRELACIONADA = ite.NUMOS)
            AND it3.NUMITEM = ite.NUMITEM)
          AND u3.CODGRUPO = 18)
  END AS codVeiculoItem,
  vei.PLACA AS placaItem,
  CAST(ISNULL(vei.AD_TIPOEQPTO, '') AS VARCHAR(100)) AS tipoEquipItem,
  vei.AD_TAG AS tagItem
FROM TCSITE ite
LEFT JOIN TGFPRO serv ON serv.CODPROD = ite.CODSERV
LEFT JOIN TCSITS sits ON sits.CODSIT = ite.CODSIT
LEFT JOIN TSIUSU usu ON usu.CODUSU = ite.CODUSU
LEFT JOIN TGFVEI vei ON vei.CODVEICULO = CASE WHEN usu.CODGRUPO = 18 THEN usu.AD_CODVEICULO ELSE NULL END
WHERE ite.NUMOS = @numos
ORDER BY ite.NUMITEM
`;
