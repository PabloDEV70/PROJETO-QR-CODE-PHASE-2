export interface RdoAnalyticsMotivo {
  rdomotivocod: number;
  descricao: string;
  sigla: string;
  totalItens: number;
  /** Distinct RDOs that had at least one apontamento with this motivo */
  rdosComMotivo: number;
  totalHoras: number;
  mediaMinutosPorItem: number;
  percentualDoTotal: number;
  toleranciaProgramadaTotalMin: number;
}

export interface RdoAnalyticsMotivoPorColaborador {
  codparc: number;
  nomeparc: string;
  cargo: string;
  departamento: string;
  rdomotivocod: number;
  descricao: string;
  sigla: string;
  totalItens: number;
  horasNoMotivo: number;
  percentual: number;
}
