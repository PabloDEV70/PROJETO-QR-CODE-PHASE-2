export interface OsComercial {
  numos: number;
  situacao: string;
  codparc: number;
  nomeParc: string;
  dtabertura: string | null;
  dtfechamento: string | null;
  qtdDiarias: number;
  dhPrevistaIni: string | null;
  dhPrevistaFim: string | null;
  inicexec: string | null;
  termexec: string | null;
  localExecucao: string | null;
  operadorNome: string | null;
  codparcOperador: number | null;
  tippessoaOperador: string | null;
}
