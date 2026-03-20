/**
 * Busca templates de horarios semanais (TFPHOR).
 * Agrega turnos por dia da semana para obter total de minutos/dia.
 * DIASEM: 1=Domingo, 2=Segunda, ..., 7=Sabado
 * Tempo em HHMM (ex: 700=07:00, 1200=12:00)
 */
export const getHorariosSemanais = `
SELECT
  h.CODCARGAHOR,
  h.DIASEM,
  SUM(
    CASE
      WHEN h.ENTRADA IS NOT NULL
       AND h.SAIDA IS NOT NULL
      THEN ((h.SAIDA / 100) * 60 + (h.SAIDA % 100))
         - ((h.ENTRADA / 100) * 60 + (h.ENTRADA % 100))
      ELSE 0
    END
  ) AS minutosDia
FROM TFPHOR h
GROUP BY h.CODCARGAHOR, h.DIASEM
`;
