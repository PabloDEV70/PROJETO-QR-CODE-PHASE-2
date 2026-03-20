export interface ListOsComercialOptions {
  page: number;
  limit: number;
  situacao?: string;
  dataInicio?: string;
  dataFim?: string;
  codparc?: number;
  exibeDash?: 'S' | 'N';
  orderBy?: string;
  orderDir?: 'ASC' | 'DESC';
}
