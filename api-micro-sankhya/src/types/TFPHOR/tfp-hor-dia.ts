export interface TfpHorDia {
  codcargahor: number;
  diasem: number;
  diasemLabel: string;
  turno: number;
  entrada: number | null;
  saida: number | null;
  entradaFmt: string | null;
  saidaFmt: string | null;
  horasTurno: number;
  folga: boolean;
}
