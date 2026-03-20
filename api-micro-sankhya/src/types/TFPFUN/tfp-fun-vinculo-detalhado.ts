import { TfpFunVinculo } from './tfp-fun-vinculo';
import { TfpHorDia } from '../TFPHOR/tfp-hor-dia';

export interface TfpFunVinculoDetalhado extends TfpFunVinculo {
  nomeparc: string;
  telefoneParceiro: string | null;
  emailParceiro: string | null;
  cargaHoraria: TfpHorDia[] | null;
}
