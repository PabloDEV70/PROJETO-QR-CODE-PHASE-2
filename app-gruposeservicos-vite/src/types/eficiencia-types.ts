export interface ServicoComExecucao {
  codProd: number;
  descrProd: string;
  codGrupo: number;
  descrGrupo: string;
  codGrupoPai: number | null;
  grauGrupo: number;
  descrGrupoPai: string | null;
  totalExecucoes: number;
  totalExecutores: number;
  mediaMinutos: number;
}

export interface GrupoArvoreMan {
  codGrupo: number;
  descricao: string;
  codGrupoPai: number | null;
  grau: number;
  qtdServicos: number;
}

export interface PerfServicoResumo {
  totalExecutores: number;
  totalExecucoes: number;
  mediaMinutos: number;
  minMinutos: number;
  maxMinutos: number;
  totalMinutos: number;
}

export interface PerfExecutor {
  codusu: number;
  nomeUsuario: string | null;
  nomeColaborador: string | null;
  codparc: number | null;
  codemp: number | null;
  codfunc: number | null;
  situacao: string;
  cargo: string | null;
  departamento: string | null;
  totalExecucoes: number;
  mediaMinutos: number;
  minMinutos: number;
  maxMinutos: number;
  totalMinutos: number;
  primeiraExec: string | null;
  ultimaExec: string | null;
}

export interface PerfExecucao {
  nuos: number;
  sequencia: number;
  codusu: number | null;
  nomeUsuario: string | null;
  nomeColaborador: string | null;
  codparc: number | null;
  dtIni: string | null;
  dtFin: string | null;
  minutos: number;
  statusOs: string | null;
  statusOsLabel: string | null;
  placa: string | null;
  marcaModelo: string | null;
  observacao: string | null;
}

export interface PerfServicoResponse {
  resumo: PerfServicoResumo;
  executores: PerfExecutor[];
}

export interface EficienciaParams {
  codprod: number;
  dataInicio?: string;
  dataFim?: string;
  codveiculo?: number;
}
