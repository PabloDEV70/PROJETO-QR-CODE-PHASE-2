/**
 * Busca a carga horária ATUAL do funcionário via TFPFHO (histórico de escalas).
 * TFPFUN.CODCARGAHOR pode estar desatualizado - TFPFHO é a fonte correta.
 * Retorna o registro mais recente (TOP 1 por DTINIESCALA DESC) com descrição da TFPCGH.
 */
export const cargaHorariaAtual = `
SELECT TOP 1
  FHO.CODCARGAHOR AS codcargahor,
  CGH.DESCRCARGAHOR AS descricao,
  CONVERT(VARCHAR(10), FHO.DTINIESCALA, 120) AS dtInicioEscala
FROM TFPFHO FHO
LEFT JOIN TFPCGH CGH ON CGH.CODCARGAHOR = FHO.CODCARGAHOR
WHERE FHO.CODEMP = @codemp AND FHO.CODFUNC = @codfunc
ORDER BY FHO.DTINIESCALA DESC
`;
