export { HstVeiRaw } from './hstvei-raw';
export { HstVeiEnriched } from './hstvei-enriched';
export { PainelPessoa, PainelSituacao, PainelVeiculo, PainelResponse } from './hstvei-painel';
export { HistoricoItem, HistoricoResponse } from './hstvei-historico';
export { CriarHstVeiInput } from './hstvei-create';
export { AtualizarHstVeiInput } from './hstvei-update';
export { ListHstVeiOptions } from './hstvei-list-options';
export { Situacao } from './situacao';
export { Prioridade } from './prioridade';

export interface HstVeiStats {
  veiculosComSituacao: number;
  situacoesAtivas: number;
  urgentes: number;
  atrasadas: number;
  previsao3dias: number;
  veiculosManutencao: number;
  veiculosComercial: number;
  veiculosLogistica: number;
  veiculosOperacao: number;
}

export interface CadeiaNota {
  nunotaDestino: number;
  nunotaOrigem: number;
  statusNota: string;
  codtipoper: number;
  tipoOperacao: string;
  codparc: number | null;
  fornecedor: string | null;
  codusu: number | null;
  responsavel: string | null;
  dataNegociacao: string | null;
}

export interface ItemNota {
  nunota: number;
  sequencia: number;
  codprod: number;
  produto: string;
  quantidade: number | null;
  valorUnitario: number | null;
  valorTotal: number | null;
  codexec: number | null;
  executor: string | null;
}
