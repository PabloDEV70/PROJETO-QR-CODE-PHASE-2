import { SITUACAO_LABELS } from '../../types/TFPFUN';

export function formatHorario(hhmm: number | null): string | null {
  if (hhmm === null || hhmm === undefined) return null;
  const h = Math.floor(hhmm / 100);
  const m = hhmm % 100;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function calcularMinutosTurno(entrada: number | null, saida: number | null): number {
  if (entrada === null || saida === null) return 0;
  const entradaMin = Math.floor(entrada / 100) * 60 + (entrada % 100);
  const saidaMin = Math.floor(saida / 100) * 60 + (saida % 100);
  return saidaMin - entradaMin;
}

export function calcularHorasSemanais(dias: { entrada: number | null; saida: number | null }[]): number {
  return dias.reduce((total, dia) => total + calcularMinutosTurno(dia.entrada, dia.saida), 0);
}

export function formatMinutosParaHoras(minutos: number): string {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function labelSituacao(situacao: string): string {
  return SITUACAO_LABELS[situacao] || `Desconhecido (${situacao})`;
}
