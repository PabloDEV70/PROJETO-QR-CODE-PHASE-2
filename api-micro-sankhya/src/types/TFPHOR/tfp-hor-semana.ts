import { TfpHorDia } from './tfp-hor-dia';

export interface TfpHorSemana {
  codcargahor: number;
  dias: TfpHorDia[];
  totalHorasSemana: number;
  totalHorasSemanaFmt: string;
}
