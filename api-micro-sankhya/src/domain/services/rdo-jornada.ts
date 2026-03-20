import { ProdResult } from './rdo-produtividade-calc';

export interface RdoJornada {
  /** Total horas previstas na jornada (sem almoco) no formato HH:MM */
  horasPrevistas: string;
  /** Total horas realizadas (tempoNoTrabalho) no formato HH:MM */
  horasRealizadas: string;
  /** Saldo em minutos (positivo = extra, negativo = falta) */
  saldo: number;
  /** Saldo formatado HH:MM (sempre positivo, usar saldoPositivo para sinal) */
  saldoFormatado: string;
  /** true = realizou mais que o previsto (hora extra ou pontual), false = faltou */
  saldoPositivo: boolean;
  /** Hora extra em minutos (somente excesso, nunca negativo) */
  horaExtra: number;
  /** Hora extra formatada HH:MM */
  horaExtraFormatado: string;
}

/** Converte minutos para string HH:MM (usa valor absoluto) */
export function minutosToHHMM(minutos: number): string {
  const abs = Math.abs(minutos);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Constroi jornada a partir de um ProdResult e dos minutos previstos do dia.
 * minutosPrevistosDia vem do item (nao do ProdResult).
 */
export function buildJornada(
  prodResult: ProdResult,
  minutosPrevistosDia: number,
): RdoJornada {
  const { tempoNoTrabalho, saldoJornadaMin, horaExtraMin } = prodResult;

  return {
    horasPrevistas: minutosToHHMM(minutosPrevistosDia),
    horasRealizadas: minutosToHHMM(tempoNoTrabalho),
    saldo: saldoJornadaMin,
    saldoFormatado: minutosToHHMM(saldoJornadaMin),
    saldoPositivo: saldoJornadaMin >= 0,
    horaExtra: horaExtraMin,
    horaExtraFormatado: minutosToHHMM(horaExtraMin),
  };
}
