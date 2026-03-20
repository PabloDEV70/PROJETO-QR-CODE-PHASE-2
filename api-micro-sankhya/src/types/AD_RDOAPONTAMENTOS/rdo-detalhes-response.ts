import { RdoDetalhePeriodo } from './rdo-detalhes-periodo';

export interface RdoDetalhesResponse {
  data: RdoDetalhePeriodo[];
  meta: {
    page: number;
    limit: number;
    totalRegistros: number;
    totalMinutos: number;
    totalHoras: number;
  };
}
