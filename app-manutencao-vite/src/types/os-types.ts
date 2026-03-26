// === OS Core (UPPER_CASE — raw Sankhya table fields from /man/os endpoints) ===

export interface OrdemServico {
  NUOS: number;
  STATUS: 'A' | 'E' | 'F' | 'C' | 'R';
  MANUTENCAO: string | null;
  TIPO: string | null;
  DTABERTURA: string | null;
  DATAINI: string | null;
  DATAFIN: string | null;
  PREVISAO: string | null;
  DHALTER: string | null;
  KM: number | null;
  HORIMETRO: number | null;
  CODVEICULO: number | null;
  CODPARC: number | null;
  CODMOTORISTA: number | null;
  NUPLANO: number | null;
  AD_STATUSGIG: string | null;
  AD_BLOQUEIOS: string | null;
  AD_LOCALMANUTENCAO: string | null;
  AD_OSORIGEM: number | null;
  AD_FINALIZACAO: string | null;
  CODEMP: number | null;
  CODEMPNEGOC: number | null;
  CODCENCUS: number | null;
  CODNAT: number | null;
  CODPROJ: number | null;
  CODUSU: number | null;
  CODUSUINC: number | null;
  CODUSUFINALIZA: number | null;
  CODUSUREABRE: number | null;
  AD_CODUSUALTER: number | null;
  OSMANUAL: string | null;
  AUTOMATICO: string | null;
  NUNOTA: number | null;
  AD_NUNOTASOLCOMPRA: number | null;
  AD_NUMCONTRATO: number | null;
  AD_DHALTERSTATUS: string | null;
  AD_DATAFINAL: string | null;
  AD_DTPLANEJA: string | null;
  PLACA: string | null;
  MARCAMODELO: string | null;
  AD_TAG: string | null;
  ANOFABRIC: number | null;
  ANOMOD: number | null;
  COMBUSTIVEL: string | null;
  PROPRIO: string | null;
  NOMEMOTORISTA: string | null;
  NOMEPARC: string | null;
  NOMEEMPRESA: string | null;
  NOMEEMPNEGOC: string | null;
  DESCRCENCUS: string | null;
  DESCRNAT: string | null;
  NOMEPROJETO: string | null;
  DESCRICAOPLANO: string | null;
  NOMEUSU: string | null;
  NOMEUSUINC: string | null;
  NOMEUSUFIN: string | null;
  NOMEUSUREABRE: string | null;
  NOMEUSUALTER: string | null;
  OBSERVACAO: string | null;
  statusLabel: string | null;
  manutencaoLabel: string | null;
  tipoLabel: string | null;
  localLabel: string | null;
  finalizacaoLabel: string | null;
  TOTAL_SERVICOS: number;
  CUSTO_TOTAL: number;
}

// --- OS Detail Enriched (from /os/:nuos) ---

export interface OsDetailVeiculo {
  marca: string | null;
  placa: string | null;
  tag: string | null;
  tipo: string | null;
}

export interface OsDetailServico {
  NUOS: number;
  SEQUENCIA: number;
  CODPROD: number;
  nomeProduto: string | null;
  QTD: number;
  VLRUNIT: number;
  VLRTOT: number;
  DATAINI: string | null;
  DATAFIN: string | null;
  TEMPO: number | null;
  STATUS: string;
  OBSERVACAO: string | null;
  statusLabel: string | null;
}

export interface OsDetailExecutor {
  NUOS: number;
  SEQUENCIA: number;
  codusu: number | null;
  codparc: number | null;
  nomeUsuario: string | null;
  nomeColaborador: string | null;
  dtIni: string | null;
  dtFin: string | null;
  minutos: number | null;
  obs: string | null;
}

export interface OsDetailEnriched {
  NUOS: number;
  DTABERTURA: string;
  DATAFIN: string | null;
  DATAINI: string | null;
  PREVISAO: string | null;
  DHALTER: string | null;
  STATUS: string;
  TIPO: string | null;
  MANUTENCAO: string | null;
  CODVEICULO: number | null;
  HORIMETRO: number | null;
  KM: number | null;
  CODEMP: number | null;
  NUPLANO: number | null;
  AD_STATUSGIG: string | null;
  AD_FINALIZACAO: string | null;
  AD_LOCALMANUTENCAO: string | null;
  AD_BLOQUEIOS: string | null;
  AD_OSORIGEM: number | null;
  CODPARC: number | null;
  CODMOTORISTA: number | null;
  statusLabel: string | null;
  manutencaoLabel: string | null;
  tipoLabel: string | null;
  localLabel: string | null;
  finalizacaoLabel: string | null;
  totalServicos: number;
  custoTotal: number;
  nomeUsuInc: string | null;
  nomeUsuAlter: string | null;
  nomeUsuFin: string | null;
  veiculo: OsDetailVeiculo;
  servicos: OsDetailServico[];
  executores: OsDetailExecutor[];
}

export interface ServicoOs {
  NUOS: number;
  SEQUENCIA: number;
  CODPROD: number | null;
  DESCRPROD: string | null;
  QTD: number | null;
  VLRUNIT: number | null;
  VLRTOT: number | null;
  TEMPO: number | null;
  STATUS: string | null;
  OBSERVACAO: string | null;
  DATAINI: string | null;
  DATAFIN: string | null;
}

export interface OsResumo {
  /** Backend /os/resumo returns flat counts */
  totalOs: number;
  abertas: number;
  emExecucao: number;
  fechadas: number;
  canceladas: number;
  veiculosAtendidos: number;
  /** Enriched fields (optional — may not exist from all endpoints) */
  porStatus?: { status: string; label: string; total: number }[];
  porTipo?: { tipo: string; label: string; total: number }[];
  porStatusGig?: { statusGig: string; label: string; total: number }[];
  total?: number;
  custoTotal?: number;
}

export interface OsKanbanColumn {
  status: string;
  label: string;
  color: 'warning' | 'info' | 'success' | 'error' | 'default';
  ordem: number;
  ordens: OrdemServico[];
}

export interface TipoManutencaoResumo {
  TIPO: string | null;
  LABEL: string;
  TOTAL: number;
  FINALIZADAS: number;
  ATIVAS: number;
  CUSTO_TOTAL: number;
}

export interface OsListParams {
  page?: number;
  limit?: number;
  status?: string;
  manutencao?: string;
  statusGig?: string;
  tipo?: string;
  codveiculo?: number;
  search?: string;
  dataInicio?: string;
  dataFim?: string;
}

export type OsStatusCode = OrdemServico['STATUS'];

export interface MutationResult {
  foiSucesso: boolean;
  sucesso: boolean;
  registrosAfetados: number;
  mensagem: string;
}

// --- KPIs & Dashboard (camelCase — backend enriched endpoints) ---

export interface OsKpis {
  totalAtivas: number;
  osAbertas: number;
  osEmExecucao: number;
  corretivas: number;
  preventivas: number;
  comBloqueioComercial: number;
  atrasadas: number;
  naoImpeditivas: number;
}

export interface OsDashboardData {
  porStatus: { status: string | null; statusLabel: string | null; total: number }[];
  porTipoManutencao: { manutencao: string | null; manutencaoLabel: string | null; total: number }[];
  recentes: OsRecente[];
  paraExibir: OsRecente[];
}

export interface OsRecente {
  NUOS: number;
  DTABERTURA: string | null;
  STATUS: string | null;
  statusLabel: string | null;
  MANUTENCAO: string | null;
  manutencaoLabel: string | null;
  CODVEICULO: number | null;
  placa: string | null;
  marcaModelo: string | null;
}

// --- Alertas (camelCase — backend enriched) ---

export interface OsAlerta {
  tipo: string;
  mensagem: string;
  codveiculo: number;
  placa: string | null;
  nuos: number;
  status: string | null;
  manutencao: string | null;
  adStatusGig: string | null;
  dtAbertura: string | null;
  diasAtraso: number;
}

export interface OsAtivaDetalhada {
  nuos: number;
  codveiculo: number;
  placa: string | null;
  status: string | null;
  statusDesc: string | null;
  manutencao: string | null;
  manutencaoDesc: string | null;
  dataIni: string | null;
  previsao: string | null;
  diasEmManutencao: number;
  situacaoPrazo: 'ATRASADA' | 'PROXIMA' | 'NO_PRAZO';
  qtdServicos: number;
  servicosConcluidos: number;
  adStatusGig: string | null;
  adBloqueios: string | null;
}

export interface OsMediaDias {
  manutencao: string;
  label: string;
  mediaDias: number;
  total: number;
}

export interface VeiculoMultiplasOs {
  codveiculo: number;
  placa: string | null;
  qtdOsAtivas: number;
}

// --- Planos Preventivos (camelCase) ---

export interface PlanoManutencao {
  nuplano: number;
  codprod: number | null;
  descricao: string | null;
  tipo: string | null;
  tempo: number | null;
  kmhorimetro: number | null;
  perctolerancia: number | null;
  repetir: string | null;
  prioplano: number | null;
  emailnotificacao: string | null;
  adNumcontrato: number | null;
  adAgrupador: string | null;
  ativo: string | null;
}

export interface AderenciaPlano {
  nuplano: number;
  descricao: string | null;
  tipo: string | null;
  intervaloDias: number | null;
  intervaloKm: number | null;
  codveiculo: number;
  placa: string | null;
  ultimaManutencao: string | null;
  diasDesdeUltima: number | null;
  situacao: 'ATRASADA' | 'PROXIMA' | 'EM_DIA' | 'SEM_HISTORICO';
  diasAtraso: number | null;
}

export interface PlanoResumo {
  total: number;
  atrasadas: number;
  proximas: number;
  emDia: number;
  semHistorico: number;
}

export interface ManutencaoAtrasada {
  nuplano: number;
  descricao: string | null;
  intervaloDias: number | null;
  codveiculo: number;
  placa: string | null;
  ultimaManutencao: string | null;
  diasDesdeUltima: number | null;
  diasAtraso: number | null;
}

// --- Ranking / Produtividade (camelCase) ---

export interface TecnicoProdutividade {
  codusu: number;
  nomeUsuario: string | null;
  totalOs: number;
  totalServicos: number;
  mediaMinutosServico: number | null;
  totalMinutos: number | null;
}

// --- Veiculo Detail (camelCase nested) ---

export interface VeiculoDashboard {
  veiculo: {
    codveiculo: number;
    placa: string;
    adTag: string | null;
    marcaModelo: string;
    tipoEquipamento: string | null;
    kmAcum: number;
    proprietario?: { codparc: number; nome: string };
    motorista?: { codparc: number; nome: string };
  };
  statusOperacional: 'OPERACIONAL' | 'EM_MANUTENCAO' | 'BLOQUEADO';
  osAtivasCount: number;
  ultimaManutencao: {
    data: string | null;
    km: number | null;
    tipo: string | null;
    custo: number | null;
  } | null;
  proximaManutencao: {
    data: string | null;
    km: number | null;
    diasRestantes: number | null;
    status: 'EM_DIA' | 'ATRASADA' | 'SEM_PLANO' | 'PROXIMO_VENCER';
  } | null;
  scoreAderencia: number | null;
  custos: {
    mesAtual: number;
    ultimoMes: number;
    acumuladoAno: number;
    mediaMensal: number;
  };
  alertas: {
    tipo: string;
    mensagem: string;
    severidade: 'INFO' | 'WARNING' | 'CRITICAL';
  }[];
}

export interface ProximaManutencao {
  nuplano: number;
  descricao: string;
  tipo: string | null;
  tipoLabel: string | null;
  intervaloDias: number | null;
  intervaloKm: number | null;
  percentualTolerancia: number | null;
  statusPlano: 'ATIVO' | 'VENCIDO' | 'PROXIMO_VENCER';
  dataUltima: string | null;
  kmUltima: number | null;
  dataProxima: string | null;
  kmProximo: number | null;
  diasAtraso: number | null;
  kmAtraso: number | null;
  scoreAderencia: number | null;
}

export interface VeiculoHistorico {
  nuos: number;
  dataAbertura: string | null;
  dataInicio: string | null;
  dataFin: string | null;
  status: string | null;
  statusLabel: string | null;
  statusGig: string | null;
  tipoManutencao: string | null;
  tipoManutencaoLabel: string | null;
  km: number | null;
  horimetro: number | null;
  custoTotal: number;
  diasAberto: number | null;
  isRetrabalho: boolean;
}

export interface VeiculoCusto {
  mes: string;
  custo: number;
  totalOs: number;
}

// --- Frota (camelCase nested) ---

export interface FrotaStatusResponse {
  resumo: {
    totalVeiculos: number;
    operacionais: number;
    emManutencao: number;
    bloqueados: number;
    percentualOperacional: number;
  };
  porStatus: {
    status: string;
    count: number;
    percent: number;
    veiculos: {
      codveiculo: number;
      placa: string;
      adTag: string | null;
    }[];
  }[];
  manutencoesUrgentes: FrotaVeiculoUrgente[];
}

export interface FrotaVeiculoUrgente {
  codveiculo: number;
  placa: string;
  adTag: string | null;
  diasAberto: number;
  statusGig: string | null;
}

export interface VeiculoFrotaItem {
  codveiculo: number;
  placa: string;
  adTag: string | null;
  marcaModelo?: string;
  tipoEquipamento?: string | null;
}

export interface ManutencaoUrgente {
  codveiculo: number;
  placa: string;
  adTag: string | null;
  diasAberto: number;
  statusGig: string | null;
}

// --- Tempo Servicos (camelCase) ---

export interface TempoServicosResumo {
  totalServicos: number;
  comDatasValidas: number;
  nuncaExecutados: number;
  mediaHoras: number;
  pctValidos: number;
}

export interface TempoServicosPorTipo {
  manutencao: string;
  label: string;
  total: number;
  validos: number;
  nuncaExecutados: number;
  mediaHoras: number;
}

export interface TempoServicosDistribuicao {
  faixa: string;
  total: number;
  pct: number;
}

export interface TempoServicosExecutor {
  codusu: number;
  nomeExecutor: string;
  codparc: number | null;
  codemp: number | null;
  codfunc: number | null;
  cargo: string | null;
  departamento: string | null;
  totalServicos: number;
  servicosConcluidos: number;
  mediaMinutos: number;
  totalMinutos: number;
}

export interface TempoServicosGrupo {
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

export interface TempoServicosTendencia {
  ano: number;
  mes: number;
  totalServicos: number;
  mediaHoras: number;
}

export interface TempoServicosResponse {
  resumo: TempoServicosResumo;
  porTipo: TempoServicosPorTipo[];
  distribuicao: TempoServicosDistribuicao[];
  porExecutor: TempoServicosExecutor[];
  porGrupo: TempoServicosGrupo[];
  topServicos: TempoServicosTopServico[];
  tendencia: TempoServicosTendencia[];
}

// --- Performance Servico x Executor (camelCase) ---

export interface PerfServicoExecutor {
  codusu: number;
  nomeUsuario: string;
  nomeColaborador: string;
  codparc: number | null;
  codemp: number | null;
  codfunc: number | null;
  situacao: string | null;
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

export interface GrupoArvore {
  codGrupo: number;
  descricao: string;
  codGrupoPai: number;
  grau: number;
  qtdServicos: number;
}

export interface ServicoGrupo {
  codProd: number;
  descrProd: string;
  codGrupo: number;
}

export interface ServicoComExecucao {
  codProd: number;
  descrProd: string;
  codGrupo: number;
  descrGrupo: string | null;
  codGrupoPai: number | null;
  grauGrupo: number | null;
  descrGrupoPai: string | null;
  totalExecucoes: number;
  totalExecutores: number;
  mediaMinutos: number;
}

export interface PerfServicoExecucao {
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

export interface PerfServicoResumo {
  totalExecutores: number;
  totalExecucoes: number;
  mediaMinutos: number;
  minMinutos: number;
  maxMinutos: number;
  totalMinutos: number;
}

export interface PerfServicoResponse {
  resumo: PerfServicoResumo;
  executores: PerfServicoExecutor[];
}

// --- Servicos Frequentes (camelCase) ---

export interface ServicoFrequente {
  codprod: number;
  servico: string | null;
  execucoes: number;
  totalOs: number;
  ultimaExecucao: string | null;
}
