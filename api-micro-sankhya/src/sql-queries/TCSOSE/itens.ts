export const itens = `
SELECT TOP 50
  itens.NUMOS,
  itens.NUMITEM,
  itens.CODSERV,
  itens.TEMPGASTO,
  itens.AD_CODVEICULO
FROM TCSITE itens
WHERE itens.NUMOS = @numos
ORDER BY itens.NUMITEM
`;
