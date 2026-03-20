export const cargaHoraria = `
SELECT
  H.CODCARGAHOR AS codcargahor,
  H.DIASEM AS diasem,
  H.TURNO AS turno,
  H.ENTRADA AS entrada,
  H.SAIDA AS saida,
  H.PAUSA AS pausa,
  H.DESCANSOSEM AS descansosem
FROM TFPHOR H
WHERE H.CODCARGAHOR = @codcargahor
ORDER BY H.DIASEM, H.TURNO
`;
