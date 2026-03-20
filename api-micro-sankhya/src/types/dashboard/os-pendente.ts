export interface OsPendente {
  tipo: 'MANUTENCAO' | 'COMERCIAL';
  numeroOS: string;
  dataAbertura: string;
  status: string;
  veiculoPlaca: string | null;
}
