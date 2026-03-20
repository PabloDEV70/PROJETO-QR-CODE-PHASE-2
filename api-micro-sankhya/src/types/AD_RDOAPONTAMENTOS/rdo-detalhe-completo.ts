export interface RdoDetalheCompleto {
  CODRDO: number;
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
  /* Servico da OS (TCFSERVOS via OUTER APPLY) */
  servicoCodProd: number | null;
  servicoNome: string | null;
  servicoObs: string | null;
  servicoTempo: number | null;
  servicoStatus: string | null;
  osQtdServicos: number | null;
}
