export interface TempoServicosResumo {
  totalServicos: number;
  comDatasValidas: number;
  nuncaExecutados: number;
  mediaHoras: number;
}

export interface TempoServicosPorTipo {
  manutencao: string;
  label: string;
  total: number;
  validos: number;
  nuncaExecutados: number;
  mediaHoras: number;
}

export interface TempoServicosDistribuicaoRow {
  faixa: string;
  total: number;
}

export interface TempoServicosPorExecutor {
  codusu: number;
  nomeExecutor: string;
  codparc: number;
  codemp: number | null;
  codfunc: number | null;
  cargo: string | null;
  departamento: string | null;
  totalServicos: number;
  servicosConcluidos: number;
  mediaMinutos: number;
  totalMinutos: number;
}

export interface TempoServicosPorGrupo {
  codGrupoProd: number;
  descrGrupo: string;
  totalServicos: number;
  validos: number;
  mediaHoras: number;
}

export interface TempoServicosTopServico {
  codProd: number;
  descrProd: string;
  totalExecucoes: number;
  mediaHoras: number;
  minHoras: number;
  maxHoras: number;
}

export interface TempoServicosTendenciaMensal {
  ano: number;
  mes: number;
  totalServicos: number;
  mediaHoras: number;
}
