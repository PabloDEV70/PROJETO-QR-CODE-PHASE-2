import { OsManutencao } from './os-manutencao';

export interface OsCompleta extends OsManutencao {
  placa: string | null;
  marcaModelo: string | null;
  tagVeiculo: string | null;
  nomeParc: string | null;
  statusLabel: string | null;
  manutencaoLabel: string | null;
  totalServicos: number;
}
