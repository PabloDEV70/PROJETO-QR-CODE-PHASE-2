export interface RdoDetalhePeriodo {
  CODRDO: number;
  DTREF: string | null;
  CODPARC: number | null;
  nomeparc: string | null;
  cgc_cpf: string | null;
  ITEM: number;
  HRINI: number | null;
  HRFIM: number | null;
  hriniFormatada: string | null;
  hrfimFormatada: string | null;
  duracaoMinutos: number | null;
  RDOMOTIVOCOD: number | null;
  motivoDescricao: string | null;
  motivoSigla: string | null;
  motivoProdutivo: 'S' | 'N' | null;
  motivoCategoria: string | null;
  NUOS: number | null;
  osStatus: string | null;
  veiculoPlaca: string | null;
  veiculoModelo: string | null;
  OBS: string | null;
  /* Servico da OS (TCFSERVOS) */
  servicoCodProd: number | null;
  servicoNome: string | null;
  servicoObs: string | null;
  servicoTempo: number | null;
  servicoStatus: string | null;
  osQtdServicos: number | null;
  /* Funcionario */
  coddep: number | null;
  departamento: string | null;
  codcargo: number | null;
  cargo: string | null;
  codfuncao: number | null;
  funcao: string | null;
  codemp: number | null;
  empresa: string | null;
}
