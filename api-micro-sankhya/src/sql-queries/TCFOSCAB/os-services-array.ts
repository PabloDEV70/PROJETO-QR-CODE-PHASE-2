export const osServicesArray = `
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
  CASE srv.STATUS
    WHEN 'F' THEN 'Finalizado'
    WHEN 'E' THEN 'Executando'
    WHEN 'A' THEN 'Aberto'
    WHEN 'R' THEN 'Rejeitado'
    ELSE srv.STATUS
  END as statusLabel,
  p.CODGRUPOPROD as codGrupo,
  g.DESCRGRUPOPROD as nomeGrupo
FROM TCFSERVOS srv
LEFT JOIN TGFPRO p ON srv.CODPROD = p.CODPROD
LEFT JOIN TGFGRU g ON p.CODGRUPOPROD = g.CODGRUPOPROD
WHERE srv.NUOS = @nuos
ORDER BY srv.SEQUENCIA
`;
