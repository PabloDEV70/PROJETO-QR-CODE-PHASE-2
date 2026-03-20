export interface ListHstVeiOptions {
  page: number;
  limit: number;
  codveiculo?: number;
  idsit?: number;
  idpri?: number;
  coddep?: number;
  ativas?: boolean;
  busca?: string;
  orderBy?: string;
  orderDir?: 'ASC' | 'DESC';
}
