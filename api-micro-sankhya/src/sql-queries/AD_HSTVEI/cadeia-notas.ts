export const cadeiaNotas = `
SELECT
  var.NUNOTA AS nunotaDestino,
  var.NUNOTAORIG AS nunotaOrigem,
  var.STATUSNOTA AS statusNota,
  cab.CODTIPOPER AS codtipoper,
  top.DESCROPER AS tipoOperacao,
  cab.CODPARC AS codparc,
  par.NOMEPARC AS fornecedor,
  cab.CODUSU AS codusu,
  usu.NOMEUSU AS responsavel,
  cab.DTNEG AS dataNegociacao
FROM TGFVAR var
INNER JOIN TGFCAB cab ON cab.NUNOTA = var.NUNOTAORIG
INNER JOIN TGFTOP top ON top.CODTIPOPER = cab.CODTIPOPER
  AND top.DHALTER = (SELECT MAX(t2.DHALTER) FROM TGFTOP t2 WHERE t2.CODTIPOPER = cab.CODTIPOPER)
LEFT JOIN TGFPAR par ON par.CODPARC = cab.CODPARC
LEFT JOIN TSIUSU usu ON usu.CODUSU = cab.CODUSU
WHERE var.NUNOTA = @nunota
ORDER BY var.SEQUENCIA
`;
