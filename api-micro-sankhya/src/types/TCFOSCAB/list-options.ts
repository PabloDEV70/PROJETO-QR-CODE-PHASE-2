export interface ListOsManutencaoOptions {
  page: number;
  limit: number;
  status?: string;
  manutencao?: string;
  adStatusGig?: string;
  codveiculo?: number;
  codparc?: number;
  dataInicio?: string;
  dataFim?: string;
  orderBy?: string;
  orderDir?: 'ASC' | 'DESC';
}
