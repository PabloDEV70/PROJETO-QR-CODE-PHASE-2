export interface OsAnaliseTipoVeiculo {
  tipoVeiculo: string;
  totalOs: number;
  totalExecucoes: number;
  mediaMinutos: number | null;
  minMinutos: number | null;
  maxMinutos: number | null;
  veiculosDistintos: number;
}

export interface OsTendenciaTipoVeiculo {
  mes: string;
  totalOs: number;
  mediaMinutos: number | null;
  totalExecucoes: number;
}
