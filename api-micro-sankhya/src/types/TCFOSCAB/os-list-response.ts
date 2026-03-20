import { OsCompleta } from './os-completa';

export interface OsListResponse {
  data: OsCompleta[];
  meta: {
    page: number;
    limit: number;
    totalRegistros: number;
  };
}
