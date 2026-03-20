export type PerfilVeiculoInclude =
  | 'osComerciais'
  | 'osManutencao'
  | 'contratos';

export const VALID_INCLUDES: PerfilVeiculoInclude[] = [
  'osComerciais',
  'osManutencao',
  'contratos',
];
