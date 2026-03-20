export const pesquisar = `
SELECT TOP 50
  os.NUMOS,
  os.SITUACAO,
  os.DHCHAMADA,
  os.DTFECHAMENTO,
  os.DESCRICAO,
  os.CODPARC,
  parc.NOMEPARC as nomeParc,
  usr.NOMEUSU as nomeResponsavel,
  CASE os.SITUACAO
    WHEN 'F' THEN 'Fechada'
    WHEN 'A' THEN 'Aberta'
    WHEN 'P' THEN 'Pendente'
    WHEN 'C' THEN 'Cancelada'
    ELSE os.SITUACAO
  END as situacaoLabel
FROM TCSOSE os
LEFT JOIN TGFPAR parc ON os.CODPARC = parc.CODPARC
LEFT JOIN TSIUSU usr ON os.CODUSURESP = usr.CODUSU
WHERE os.NUMOS = TRY_CAST('@sanitizedTerm' AS INT)
  OR parc.NOMEPARC LIKE '%@sanitizedTerm%'
  OR os.DESCRICAO LIKE '%@sanitizedTerm%'
ORDER BY os.DHCHAMADA DESC
`;
