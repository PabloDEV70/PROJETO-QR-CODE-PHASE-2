export interface TCFMAN {
  NUPLANO: number;
  AD_AGRUPADOR: string | null;
  TIPO: 'T' | 'K' | 'KT' | null;
  DESCRICAO: string | null;
  TEMPO: number | null;
  KMHORIMETRO: number | null;
  PERCTOLERANCIA: number | null;
  REPETIR: string | null;
  ATIVO: string | null;
}

export interface PlanoManutencao {
  nuplano: number;
  descricao: string;
  tipo: 'T' | 'K' | 'KT';
  tempo: number | null;
  kmhorimetro: number | null;
  percTolerancia: number | null;
  repetir: string | null;
  ativo: string | null;
}

export interface AderenciaPlano {
  codveiculo: number;
  placa: string;
  nuplano: number;
  descricao: string;
  ultimaData: string | null;
  diasAtraso: number | null;
  situacao: string;
}
