export interface RequisicaoItem {
  NUNOTA: number;
  DESCRPROD: string;
  CONTROLE: string | null;
  QTDNEG: number;
  QTDENTREGUE: number;
  QTDPENDENTE: number;
  OBSERVACAO: string | null;
  AD_PRIORIDADE: number | null;
  DTNEG: string | null;
  DHLIB: string | null;
  APLICACAO: string | null;
  MARCAMODELO: string | null;
  NOMEUSU: string | null;
  DTLIMITE: string | null;
  PRIORIDADE: string | null;
  CONTROLE_DIAS: number | null;
  CODTIPOPER: number | null;
  CODPROD: number | null;
  CODVEICULO: number | null;
}

export interface CotacaoItem {
  NUMCOTACAO: number;
  SITUACAO: string | null;
  DHINIC: string | null;
  COMPRADOR: string | null;
  QTD_NOTAS: number;
  CODUSUREQ: number | null;
}

export interface ComprasResumo {
  requisicoesPendentesCompras: number;
  requisicoesPendentesManut: number;
  cotacoesPendentes: number;
  pedidosPendentes: number;
}

export const PRIORIDADE_COLORS: Record<string, string> = {
  EMERGENCIA: '#b71c1c',
  'MUITO URGENTE': '#c62828',
  URGENTE: '#e65100',
  'POUCO URGENTE': '#f57f17',
  PROGRAMADA: '#1565c0',
  'PROGRAMADA URGENTE': '#d32f2f',
};

export const PRIORIDADE_LABELS: Record<number, string> = {
  0: 'Emergencia',
  1: 'Muito Urgente',
  2: 'Urgente',
  3: 'Pouco Urgente',
  4: 'Programada',
};
