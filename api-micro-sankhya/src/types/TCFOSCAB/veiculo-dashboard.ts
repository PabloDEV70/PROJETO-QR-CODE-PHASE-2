export type StatusOperacional = 'OPERACIONAL' | 'EM_MANUTENCAO' | 'BLOQUEADO';
export type StatusManutencao = 'EM_DIA' | 'ATRASADA' | 'SEM_PLANO' | 'PROXIMO_VENCER';

export interface VeiculoDashboard {
  codveiculo: number;
  placa: string;
  adTag: string | null;
  marcaModelo: string;
  tipoEquipamento: string | null;
  kmAcum: number;
  statusOperacional: StatusOperacional;
  osAtivasCount: number;
}

export interface VeiculoDashboardCompleto {
  veiculo: {
    codveiculo: number;
    placa: string;
    adTag: string | null;
    marcaModelo: string;
    tipoEquipamento: string | null;
    kmAcum: number;
    proprietario?: {
      codparc: number;
      nome: string;
    };
    motorista?: {
      codparc: number;
      nome: string;
    };
  };

  statusOperacional: StatusOperacional;
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
    status: StatusManutencao;
  } | null;

  scoreAderencia: number | null;

  custos: {
    mesAtual: number;
    ultimoMes: number;
    acumuladoAno: number;
    mediaMensal: number;
  };

  alertas: Array<{
    tipo: 'ATRASO' | 'BLOQUEIO' | 'ALTO_CUSTO' | 'RETURNO';
    mensagem: string;
    severidade: 'INFO' | 'WARNING' | 'CRITICAL';
  }>;
}

export interface VeiculoOsHistorico {
  nuos: number;
  dataAbertura: Date | null;
  dataInicio: Date | null;
  dataFin: Date | null;
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

export interface VeiculoPlanoManutencao {
  nuplano: number;
  descricao: string;
  tipo: string | null;
  tipoLabel: string | null;
  intervaloDias: number | null;
  intervaloKm: number | null;
  percentualTolerancia: number | null;

  statusPlano: 'ATIVO' | 'VENCIDO' | 'PROXIMO_VENCER';
  dataUltima: Date | null;
  kmUltima: number | null;

  dataProxima: Date | null;
  kmProximo: number | null;

  diasAtraso: number | null;
  kmAtraso: number | null;
  scoreAderencia: number | null;
}

export interface VeiculoCustoAnalise {
  ano: number;
  mes: number;
  tipoManutencao: string | null;
  tipoManutencaoLabel: string | null;
  totalOs: number;
  custoTotal: number;
  custoMedio: number;
}

export interface FrotaStatusResumo {
  totalVeiculos: number;
  operacionais: number;
  emManutencao: number;
  bloqueados: number;
  percentualOperacional: number;
}

export interface FrotaStatusPorStatus {
  status: string;
  count: number;
  percent: number;
  veiculos: Array<{
    codveiculo: number;
    placa: string;
    adTag: string | null;
  }>;
}

export interface FrotaStatusResponse {
  resumo: FrotaStatusResumo;
  porStatus: FrotaStatusPorStatus[];
  manutencoesUrgentes: Array<{
    codveiculo: number;
    placa: string;
    adTag: string | null;
    diasAberto: number;
    statusGig: string | null;
  }>;
}

export interface VeiculoRetrabalho {
  nuos: number;
  osOrigem: number | null;
  dataAbertura: Date | null;
  dataFin: Date | null;
  tipoManutencao: string | null;
  custoTotal: number;
  motivoRetrabalho: string | null;
}
