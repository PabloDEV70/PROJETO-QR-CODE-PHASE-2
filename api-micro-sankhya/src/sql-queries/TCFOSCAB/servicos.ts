export const servicos = `
SELECT
  srv.NUOS,
  srv.SEQUENCIA,
  srv.CODPROD,
  p.DESCRPROD as nomeProduto,
  srv.QTD,
  srv.VLRUNIT,
  srv.VLRTOT,
  srv.DATAINI,
  srv.DATAFIN,
  srv.TEMPO,
  srv.STATUS,
  srv.OBSERVACAO,
  srv.CONTROLE,
  srv.NUNOTA,
  srv.SEQNOTA,
  srv.CODPARC,
  srv.AD_EXIBEDASH,
  CASE srv.STATUS
    WHEN 'F' THEN 'Finalizado'
    WHEN 'A' THEN 'Aberto'
    ELSE srv.STATUS
  END as statusLabel
FROM TCFSERVOS srv
LEFT JOIN TGFPRO p ON srv.CODPROD = p.CODPROD
WHERE srv.NUOS = @nuos
ORDER BY srv.SEQUENCIA
`;
