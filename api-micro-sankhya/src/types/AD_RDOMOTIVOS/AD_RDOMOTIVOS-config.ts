export interface MotivoConfigRow {
  RDOMOTIVOCOD: number;
  PRODUTIVO: 'S' | 'N' | null;
  TOLERANCIA: number | null;
  PENALIDADE: number | null;
  WTCATEGORIA: string | null;
}

export interface MotivoConfigItem {
  rdomotivocod: number;
  produtivo: boolean;
  toleranciaMin: number;
  penalidadeMin: number;
  wtCategoria: string;
}

export type MotivoConfigMap = Map<number, MotivoConfigItem>;
