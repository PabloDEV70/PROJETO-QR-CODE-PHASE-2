export interface OsManutencao {
  nuos: number;
  codveiculo: number;
  status: string;
  statusDescricao: string;
  tipo: string;
  tipoDescricao: string;
  manutencao: string;
  manutencaoDescricao: string;
  dataini: string | null;
  previsao: string | null;
  datafin: string | null;
  km: number | null;
  horimetro: number | null;
  codparc: number | null;
  parceiroNome: string | null;
  statusGig: string | null;
  statusGigDescricao: string | null;
  bloqueios: string | null;
}
