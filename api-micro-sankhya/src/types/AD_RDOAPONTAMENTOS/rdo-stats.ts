export interface RdoStats {
  totalRdos: number;
  totalItens: number;
  totalMinutos: number | null;
  totalHoras: number | null;
  mediaItensPorRdo: number | null;
  itensComOs: number;
  itensSemOs: number;
  totalFuncionarios: number;
  percentualProdutivo: number | null;
  topColaboradores: RdoTopColaborador[];
}

export interface RdoTopColaborador {
  CODPARC: number;
  nomeparc: string | null;
  totalRdos: number;
  totalHoras: number | null;
}
