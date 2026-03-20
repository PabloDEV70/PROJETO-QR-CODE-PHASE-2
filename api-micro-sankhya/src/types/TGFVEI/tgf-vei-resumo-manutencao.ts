export interface ResumoManutencao {
  nuos: number;
  codveiculo: number;
  placa: string;
  marcamodelo: string;
  status: string;
  statusDescricao: string;
  tipo: string;
  manutencao: string;
  manutencaoDescricao: string;
  dataini: string | null;
  previsao: string | null;
  parceiroNome: string;
  statusGig: string;
  bloqueios: string;
  qtdServicos: number;
  diasAberta: number;
}
