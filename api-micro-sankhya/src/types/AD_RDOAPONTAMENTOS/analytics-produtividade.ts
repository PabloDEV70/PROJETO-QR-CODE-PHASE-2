export interface RdoAnalyticsProdutividade {
  codparc: number;
  nomeparc: string;
  totalRdos: number;
  totalItens: number;
  totalMinutos: number;
  totalHoras: number;
  mediaMinutosPorItem: number;
  mediaHorasPorRdo: number;
  desvioPadrao: number;
  itensCurtos: number;
  percentualCurtos: number;
  itensComOs: number;
  itensSemOs: number;
  percentualComOs: number;
  departamento: string | null;
  cargo: string | null;
}
