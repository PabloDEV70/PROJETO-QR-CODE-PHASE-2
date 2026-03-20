/**
 * Veículos com múltiplas OS ativas simultaneamente
 * Indicador de problemas recorrentes ou acúmulo de pendências
 */
export interface OsVeiculoMultiplas {
  codveiculo: number;
  placa: string | null;
  qtdOsAtivas: number;
}
