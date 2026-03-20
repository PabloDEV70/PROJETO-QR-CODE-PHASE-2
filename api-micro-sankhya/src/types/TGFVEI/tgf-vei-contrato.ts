export interface ContratoVeiculo {
  id: number;
  codveiculo: number;
  codparc: number;
  nomeParc: string;
  dhinic: string;
  dhfin: string;
  obs: string | null;
  statusContrato: string;
  diasRestantes: number | null;
}
