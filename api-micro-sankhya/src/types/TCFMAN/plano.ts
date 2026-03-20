/**
 * Plano de manutenção preventiva
 */
export interface PlanoManutencao {
  nuplano: number;
  codprod: number | null;
  descricao: string | null;
  tipo: string | null;
  tempo: number | null;
  kmhorimetro: number | null;
  perctolerancia: number | null;
  repetir: string | null;
  prioplano: number | null;
  emailnotificacao: string | null;
  adNumcontrato: number | null;
  adAgrupador: string | null;
  ativo: string | null;
}

/**
 * Plano com dados do veículo
 */
export interface PlanoComVeiculo extends PlanoManutencao {
  placa: string | null;
  marcaModelo: string | null;
}

/**
 * Tipos de plano
 */
export type TipoPlano = 'T' | 'K' | 'H' | 'KT';

export const TIPO_PLANO_LABELS: Record<string, string> = {
  T: 'Tempo (dias)',
  K: 'Quilometragem',
  H: 'Horímetro',
  KT: 'Híbrido (Tempo + KM)',
};
