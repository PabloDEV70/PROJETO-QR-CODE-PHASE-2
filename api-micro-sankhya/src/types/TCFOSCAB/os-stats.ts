export interface OsStats {
  totalOs: number;
  osAbertas: number;
  osFechadas: number;
  mediaDiasParaFechar: number | null;
  topVeiculos: Array<{
    codveiculo: number;
    placa: string | null;
    marcaModelo: string | null;
    totalOs: number;
  }>;
}
