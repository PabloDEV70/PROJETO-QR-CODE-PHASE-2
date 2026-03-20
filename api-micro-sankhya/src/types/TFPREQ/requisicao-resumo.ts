export interface RequisicaoResumo {
  total: number;
  porStatus: {
    pendentes: number;
    aprovados: number;
    executados: number;
    cancelados: number;
    rejeitados: number;
  };
  porTipo: {
    origemTipo: string;
    origemTipoLabel: string;
    quantidade: number;
  }[];
  pendentesUrgentes: number;
}

export interface ResumoStatusRow {
  pendentes: number;
  aprovados: number;
  executados: number;
  cancelados: number;
  rejeitados: number;
  total: number;
  pendentesUrgentes: number;
}

export interface ResumoPorTipoRow {
  origemTipo: string;
  origemTipoLabel: string;
  quantidade: number;
}
