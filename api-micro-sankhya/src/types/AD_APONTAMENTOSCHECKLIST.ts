// =============================================================================
// AD_APONTAMENTOSCHECKLIST - Tipos e Interfaces
// Respostas de Checklist vinculadas aos Apontamentos (Integração Oficina5)
// =============================================================================

export type SituacaoChecklist = 'CONCLUIDO' | 'PENDENTE';
export type SistemaOrigem = 'OF5' | 'INTERNO';
export type StatusIntegracao = 'PENDENTE' | 'SINCRONIZADO' | 'ERRO';
export type TipoPergunta = 'O' | 'U';

export const SituacaoChecklistLabels: Record<SituacaoChecklist, string> = {
  CONCLUIDO: 'Concluído',
  PENDENTE: 'Pendente',
};

export const SistemaOrigemLabels: Record<SistemaOrigem, string> = {
  OF5: 'Oficina5',
  INTERNO: 'Interno',
};

export const TipoPerguntaLabels: Record<TipoPergunta, string> = {
  O: 'Texto Livre',
  U: 'Escolha Única',
};

// Interface base do Checklist
export interface ApontamentoChecklist {
  CODAPONTAMENTO: number | null;
  CODVEICULO: number | null;
  DOCUSU: string | null;
  CODCHECKLIST: number | null;
  CODPARC: number | null;
  CODPERGUNTA: number | null;
  DESCRPERGUNTA: string | null;
  TIPOPERGUNTA: TipoPergunta | null;
  ORDEMPERGUNTA: number | null;
  MASCARAPERGUNTA: string | null;
  CODGRUPO: number | null;
  DESCRGRUPO: string | null;
  ORDEMGRUPO: number | null;
  CODRESPOSTA: number | null;
  EVIDENCIARESPOSTA: string | null;
  COMENTARIO: string | null;
  DTRESPOSTA: Date | null;
  SITUACAO: SituacaoChecklist | null;
  OBSERVACAO: string | null;
  DTACAO: Date | null;
  CODUSUACAO: number | null;
  NUNOTAOS: number | null;
  CODUSUINC: number | null;
  DTINCLUSAO: Date | null;
  CODUSUALTERACAO: number | null;
  DHALTERACAO: Date | null;
  CODUSUEXC: number | null;
  DHEXCLUSAO: Date | null;
  ATIVO: string | null;
  PLACAVEICULO: string | null;
  LATITUDE: number | null;
  LONGITUDE: number | null;
  DESCRESPOSTA: string | null;
  INDEXPERGUNTA: number | null;
  SISTEMAORIGEM: SistemaOrigem | null;
  STATUSINTEGRACAO: StatusIntegracao | null;
  METODRETORNO: string | null;
  URLRETORNO: string | null;
}

// Checklist pendente de integração
export interface ChecklistPendente {
  CODAPONTAMENTO: number;
  CODVEICULO: number | null;
  PLACAVEICULO: string | null;
  DESCRGRUPO: string | null;
  DESCRPERGUNTA: string | null;
  DESCRESPOSTA: string | null;
  SISTEMAORIGEM: SistemaOrigem | null;
  STATUSINTEGRACAO: StatusIntegracao | null;
  DTRESPOSTA: Date | null;
  URLRETORNO: string | null;
}

// Dashboard de integração
export interface IntegracaoDashboard {
  sistemaOrigem: SistemaOrigem | null;
  statusIntegracao: StatusIntegracao | null;
  total: number;
  percentual: number;
}

// Status geral da integração
export interface IntegracaoStatus {
  totalChecklists: number;
  pendentes: number;
  sincronizados: number;
  erros: number;
  percentualPendente: number;
  alertaCritico: boolean;
  porSistema: IntegracaoDashboard[];
}

// Resposta de checklist agrupada
export interface ChecklistAgrupado {
  DESCRGRUPO: string;
  ORDEMGRUPO: number;
  perguntas: {
    DESCRPERGUNTA: string;
    DESCRESPOSTA: string | null;
    TIPOPERGUNTA: TipoPergunta | null;
    DTRESPOSTA: Date | null;
    SITUACAO: SituacaoChecklist | null;
  }[];
}
