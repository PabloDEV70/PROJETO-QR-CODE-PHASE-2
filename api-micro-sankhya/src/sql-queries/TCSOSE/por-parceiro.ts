export const porParceiro = `
SELECT * FROM (
  SELECT
    os.NUMOS,
    os.SITUACAO,
    os.DHCHAMADA,
    os.DTFECHAMENTO,
    os.DESCRICAO,
    os.TEMPOGASTOSLA,
    parc.NOMEPARC as nomeParc,
    usr.NOMEUSU as nomeResponsavel,
    CASE os.SITUACAO
      WHEN 'F' THEN 'Fechada'
      WHEN 'A' THEN 'Aberta'
      WHEN 'P' THEN 'Pendente'
      WHEN 'C' THEN 'Cancelada'
      ELSE os.SITUACAO
    END as situacaoLabel,
    (
      SELECT COUNT(*)
      FROM TCSITE itens
      WHERE itens.NUMOS = os.NUMOS
    ) as totalItens,
    ROW_NUMBER() OVER (ORDER BY os.DHCHAMADA DESC) AS RowNum
  FROM TCSOSE os
  LEFT JOIN TGFPAR parc ON os.CODPARC = parc.CODPARC
  LEFT JOIN TSIUSU usr ON os.CODUSURESP = usr.CODUSU
  WHERE os.CODPARC = @codparc
) AS T
WHERE RowNum > @OFFSET AND RowNum <= (@OFFSET + @LIMIT)
`;
