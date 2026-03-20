export interface VeiculoPerfil {
  codveiculo: number;
  placa: string;
  marcamodelo: string;
  categoria: string;
  tipo: string;
  fabricante: string;
  capacidade: string;
  anofabric: number | null;
  anomod: number | null;
  chassis: string | null;
  renavam: string | null;
  combustivel: string | null;
  kmacum: number | null;
  ativo: string;
  bloqueado: string;
  codmotorista: number | null;
  motoristaNome: string | null;
  tag: string | null;
  exibeDash: string;
  status: string;
  osComerciais?: OsComercial[];
  osManutencao?: OsManutencao[];
  contratos?: ContratoVeiculo[];
}

export interface OsManutencao {
  nuos: number;
  codveiculo: number;
  status: string;
  statusDescricao: string;
  tipo: string;
  tipoDescricao: string;
  manutencao: string;
  manutencaoDescricao: string;
  dataini: string | null;
  previsao: string | null;
  datafin: string | null;
  km: number | null;
  horimetro: number | null;
  codparc: number | null;
  parceiroNome: string | null;
  statusGig: string | null;
  statusGigDescricao: string | null;
  bloqueios: string | null;
}

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
}

export interface ContratoVeiculo {
  id: number;
  codveiculo: number;
  codparc: number;
  nomeParc: string;
  dhinic: string;
  dhfin: string;
  obs: string | null;
  statusContrato: string;
  diasRestantes: number | null;
}

export const STATUS_LABELS: Record<string, string> = {
  LIVRE: 'Livre',
  EM_USO: 'Em Uso',
  MANUTENCAO: 'Em Manutencao',
  AGUARDANDO_MANUTENCAO: 'Aguardando Manutencao',
  BLOQUEIO_COMERCIAL: 'Bloqueio Comercial',
  PARADO: 'Parado',
  ALUGADO_CONTRATO: 'Alugado (Contrato)',
  RESERVADO_CONTRATO: 'Reservado (Contrato)',
  AGENDADO: 'Agendado',
};

export const STATUS_COLORS: Record<string, 'success' | 'warning' | 'error' | 'info' | 'default'> = {
  LIVRE: 'success',
  EM_USO: 'info',
  MANUTENCAO: 'warning',
  AGUARDANDO_MANUTENCAO: 'warning',
  BLOQUEIO_COMERCIAL: 'error',
  PARADO: 'default',
  ALUGADO_CONTRATO: 'info',
  RESERVADO_CONTRATO: 'info',
  AGENDADO: 'info',
};

export const COMBUSTIVEL_MAP: Record<string, string> = {
  D: 'Diesel',
  G: 'Gasolina',
  A: 'Alcool',
  E: 'Eletrico',
  F: 'Flex',
  N: 'GNV',
};
