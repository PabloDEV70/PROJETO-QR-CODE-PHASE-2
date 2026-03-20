import { TfpFunVinculo } from './tfp-fun-vinculo';

export interface TfpFunHistorico {
  codparc: number;
  nomeparc: string;
  vinculos: TfpFunVinculo[];
  totalVinculos: number;
  vinculoAtivo: TfpFunVinculo | null;
}
