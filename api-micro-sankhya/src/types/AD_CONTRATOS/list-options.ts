export interface ListContratosOptions {
  page: number;
  limit: number;
  status?: 'vigente' | 'futuro' | 'encerrado';
  codparc?: number;
  orderBy?: string;
  orderDir?: 'ASC' | 'DESC';
}
