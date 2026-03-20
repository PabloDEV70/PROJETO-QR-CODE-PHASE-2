/**
 * Média de dias em manutenção por tipo
 * Permite identificar gargalos por categoria
 */
export interface OsMediaDias {
  manutencao: string;
  tipo: string;
  total: number;
  mediaDias: number;
}
