import { apiClient } from '@/api/client';

// Types inline for now
export interface VeiculoPerfil {
  codveiculo: number;
  placa: string;
  marcamodelo: string | null;
  tag: string | null;
  fabricante: string | null;
  capacidade: string | null;
  tipo: string | null;
  anofabric: number | null;
  anomod: number | null;
  chassis: string | null;
  renavam: string | null;
  combustivel: string | null;
  kmacum: number | null;
  ativo: string | null;
  bloqueado: string | null;
  status: string | null;
  codmotorista: number | null;
  motoristaNome: string | null;
  categoria: string | null;
  osComerciais: OsComercial[];
  osManutencao: OsManutencaoItem[];
  contratos: ContratoVeiculo[];
}

export interface OsComercial {
  numos: number;
  situacao: string;
  codparc: number | null;
  nomeParc: string | null;
  dtabertura: string | null;
  dtfechamento: string | null;
  qtdDiarias: number | null;
  dhPrevistaIni: string | null;
  dhPrevistaFim: string | null;
  inicexec: string | null;
  termexec: string | null;
  localExecucao: string | null;
  operadorNome: string | null;
  codparcOperador: number | null;
  tippessoaOperador: string | null;
}

export interface OsManutencaoItem {
  NUOS: number;
  CODVEICULO: number;
  STATUS: string;
  TIPO: string | null;
  MANUTENCAO: string | null;
  KM: number | null;
  HORIMETRO: number | null;
  DTABERTURA: string | null;
  DTPREVISAO: string | null;
  AD_LOCALMANUTENCAO: string | null;
  AD_BLOQUEIOS: string | null;
  AD_STATUSGIG: string | null;
  QTD_SERVICOS: number | null;
  SERVICOS_FINALIZADOS: number | null;
  SERVICO_PRINCIPAL: string | null;
}

export interface ContratoVeiculo {
  id: number;
  codveiculo: number;
  codparc: number | null;
  nomeParc: string | null;
  dhinic: string | null;
  dhfin: string | null;
  obs: string | null;
  statusContrato: string | null;
  diasRestantes: number | null;
}

export interface VeiculoAbastecimento {
  IDABT: number;
  CODVEICULO: number;
  KM: number | null;
  DHABT: string | null;
  STATUS: string | null;
  NUMABT: number | null;
  CODPOSTO: number | null;
  NUNOTA: number | null;
  HORIMETRO: number | null;
}

export interface VeiculoHistoricoKm {
  CODVEICULO: number;
  SEQUENCIA: number;
  KM: number | null;
  ORIGEM: string | null;
  DHREFERENCIA: string | null;
  AD_HORIMETRO: number | null;
  AD_ODOMETRO: number | null;
}

export interface VeiculoDocumento {
  CODVEICULO: number;
  CODDOC: number;
  VIGENCIAINI: string | null;
  VIGENCIAFIN: string | null;
}

export interface VeiculoConsumo {
  ID: number;
  DATA_ABASTECIMENTO: string | null;
  LITROS: number | null;
  KMPORLITRO: number | null;
  VALORMEDIOLITRO: number | null;
  KMRODADOS: number | null;
  HORASTRABALHADAS: number | null;
  MOTORISTA: string | null;
}

export interface VeiculoPlano {
  NUPLANO: number;
  CODVEICULO: number;
  DTINCLUSAO: string | null;
  DESCRICAO: string | null;
  TIPO: string | null;
  TEMPO: number | null;
  KMHORIMETRO: number | null;
  GERAAUTO: string | null;
  ATIVO: string | null;
  PERCTOLERANCIA: number | null;
}

export interface HistoricoCompletoItem {
  tipo: 'MANUTENCAO' | 'COMERCIAL';
  numOs: number;
  status: string | null;
  dataEvento: string | null;
  dataFim: string | null;
  codUsuario: number | null;
  nomeUsuario: string | null;
  codparcUsuario: number | null;
  codUsuario2: number | null;
  nomeUsuario2: string | null;
  codparcUsuario2: number | null;
  cliente: string | null;
  codparc: number | null;
  descricao: string | null;
  qtdDiarias: number | null;
  tipoManut: string | null;
  subtipo: string | null;
  km: number | null;
}

// API functions
export async function fetchVeiculoPerfil(codveiculo: number): Promise<VeiculoPerfil> {
  const { data } = await apiClient.get<VeiculoPerfil>(
    `/veiculos/${codveiculo}/perfil`,
    { params: { include: 'osComerciais,osManutencao,contratos' } },
  );
  return data;
}

export async function fetchOsManutencaoAtivas(codveiculo: number): Promise<OsManutencaoItem[]> {
  const { data } = await apiClient.get<OsManutencaoItem[]>(`/veiculos/${codveiculo}/os-manutencao-ativas`);
  return data;
}

export async function fetchVeiculoAbastecimentos(codveiculo: number): Promise<VeiculoAbastecimento[]> {
  const { data } = await apiClient.get<VeiculoAbastecimento[]>(`/veiculos/${codveiculo}/abastecimentos`);
  return data;
}

export async function fetchVeiculoHistoricoKm(codveiculo: number): Promise<VeiculoHistoricoKm[]> {
  const { data } = await apiClient.get<VeiculoHistoricoKm[]>(`/veiculos/${codveiculo}/historico-km`);
  return data;
}

export async function fetchVeiculoDocumentos(codveiculo: number): Promise<VeiculoDocumento[]> {
  const { data } = await apiClient.get<VeiculoDocumento[]>(`/veiculos/${codveiculo}/documentos`);
  return data;
}

export async function fetchVeiculoConsumo(codveiculo: number): Promise<VeiculoConsumo[]> {
  const { data } = await apiClient.get<VeiculoConsumo[]>(`/veiculos/${codveiculo}/consumo`);
  return data;
}

export async function fetchVeiculoPlanos(codveiculo: number): Promise<VeiculoPlano[]> {
  const { data } = await apiClient.get<VeiculoPlano[]>(`/veiculos/${codveiculo}/planos-preventivos`);
  return data;
}

export async function fetchVeiculoHistoricoCompleto(codveiculo: number): Promise<HistoricoCompletoItem[]> {
  const { data } = await apiClient.get<HistoricoCompletoItem[]>(`/veiculos/${codveiculo}/historico-completo`);
  return data;
}
