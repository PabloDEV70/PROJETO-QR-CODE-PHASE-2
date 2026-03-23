export interface PainelPessoa {
  codusu: number;
  nome: string;
  codparc: number | null;
}

export interface PainelSituacao {
  id: number;
  idsit: number;
  situacao: string;
  departamento: string | null;
  coddep: number;
  prioridadeSigla: string | null;
  prioridadeDescricao: string | null;
  idpri: number | null;
  descricao: string | null;
  obs: string | null;
  dtinicio: string;
  dtprevisao: string | null;
  nuos: number | null;
  numos: number | null;
  nunota: number | null;
  codparc: number | null;
  nomeParc: string | null;
  osStatus: string | null;
  osTipo: string | null;
  mosCliente: string | null;
  mosSituacao: string | null;
  mosDhChamada: string | null;
  mosDtPrevista: string | null;
  mosDescricao: string | null;
  mosEndereco: string | null;
  mosCidade: string | null;
  mosUrgencia: string | null;
  mosContrato: string | null;
  mosResponsavel: string | null;
  mosLocalExec: string | null;
  mosNrProposta: string | null;
  operadores: PainelPessoa[];
  mecanicos: PainelPessoa[];
  criadoPor: PainelPessoa;
}

export interface PainelVeiculo {
  codveiculo: number;
  placa: string;
  marcaModelo: string | null;
  tag: string | null;
  tipo: string | null;
  capacidade: string | null;
  fabricante: string | null;
  situacoesAtivas: PainelSituacao[];
  totalSituacoes: number;
  prioridadeMaxima: number | null;
  previsaoMaisProxima: string | null;
}

export interface PainelResponse {
  veiculos: PainelVeiculo[];
  totalVeiculos: number;
  totalSituacoesAtivas: number;
  atualizadoEm: string;
}

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

export interface Situacao {
  ID: number;
  DESCRICAO: string;
  CODDEP: number;
  OBS: string | null;
  departamentoNome: string | null;
}

export interface Prioridade {
  IDPRI: number;
  SIGLA: string;
  DESCRICAO: string;
}

export interface HstVeiEnriched {
  ID: number;
  CODVEICULO: number;
  IDSIT: number;
  IDPRI: number | null;
  DESCRICAO: string | null;
  OBS: string | null;
  DTINICIO: string;
  DTPREVISAO: string | null;
  DTFIM: string | null;
  NUNOTA: number | null;
  NUOS: number | null;
  NUMOS: number | null;
  CODPARC: number | null;
  EXEOPE: string | null;
  EXEMEC: string | null;
  CODUSUINC: number;
  CODUSUALT: number;
  DTCRIACAO: string;
  DTALTER: string;
  placa: string | null;
  marcaModelo: string | null;
  veiculoTag: string | null;
  situacaoDescricao: string;
  situacaoCoddep: number;
  departamentoNome: string | null;
  prioridadeSigla: string | null;
  prioridadeDescricao: string | null;
  nomeParc: string | null;
  nomeUsuInc: string | null;
  nomeUsuAlt: string | null;
  osStatus: string | null;
  osTipo: string | null;
  mosCliente: string | null;
  mosSituacao: string | null;

  // Pessoas resolvidas (enrichment)
  operadores?: PainelPessoa[];
  mecanicos?: PainelPessoa[];
  criadoPor?: PainelPessoa;
}

export interface CriarSituacaoPayload {
  codveiculo: number;
  idsit: number;
  idpri?: number;
  descricao?: string;
  obs?: string;
  dtinicio?: string;
  dtprevisao?: string;
  dtfim?: string;
  nunota?: number;
  nuos?: number;
  numos?: number;
  codparc?: number;
  exeope?: string;
  exemec?: string;
}

export interface AtualizarSituacaoPayload {
  idsit?: number;
  idpri?: number | null;
  descricao?: string | null;
  obs?: string | null;
  dtinicio?: string | null;
  dtprevisao?: string | null;
  dtfim?: string | null;
  nunota?: number | null;
  nuos?: number | null;
  numos?: number | null;
  codparc?: number | null;
  exeope?: string | null;
  exemec?: string | null;
}

export interface TrocarSituacaoPayload {
  idsit: number;
  idpri?: number;
  descricao?: string;
  obs?: string;
  dtinicio?: string;
  dtprevisao?: string;
  nunota?: number;
  nuos?: number;
  numos?: number;
  codparc?: number;
  exeope?: string;
  exemec?: string;
}

export interface HistoricoItem {
  id: number;
  idsit: number;
  situacao: string;
  situacaoCoddep: number;
  departamento: string | null;
  prioridadeSigla: string | null;
  idpri: number | null;
  descricao: string | null;
  obs: string | null;
  dtinicio: string;
  dtprevisao: string | null;
  dtfim: string | null;
  duracaoMinutos: number | null;
  nuos: number | null;
  numos: number | null;
  nunota: number | null;
  codparc: number | null;
  nomeParc: string | null;
  exeope: string | null;
  exemec: string | null;
  nomeUsuInc: string | null;
  nomeUsuAlt: string | null;
  operadores?: PainelPessoa[];
  mecanicos?: PainelPessoa[];
  criadoPor?: PainelPessoa;
}

export interface HistoricoResponse {
  codveiculo: number;
  placa: string;
  marcaModelo: string | null;
  historico: HistoricoItem[];
  meta: { page: number; limit: number; totalRegistros: number };
}

export interface CadeiaNotaItem {
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
