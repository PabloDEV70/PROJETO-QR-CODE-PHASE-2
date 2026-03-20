import { RdoListItem } from './rdo-list-item';

export interface RdoListResponse {
  data: RdoListItem[];
  meta: {
    page: number;
    limit: number;
    totalRegistros: number;
  };
}
