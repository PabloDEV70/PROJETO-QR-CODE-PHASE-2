export const DIAS_SEMANA: Record<number, string> = {
  1: 'Domingo',
  2: 'Segunda-feira',
  3: 'Terça-feira',
  4: 'Quarta-feira',
  5: 'Quinta-feira',
  6: 'Sexta-feira',
  7: 'Sábado',
};

export function labelDiaSemana(diasem: number): string {
  return DIAS_SEMANA[diasem] || `Dia ${diasem}`;
}
