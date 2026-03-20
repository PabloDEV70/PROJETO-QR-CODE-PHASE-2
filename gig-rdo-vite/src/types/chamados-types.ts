export interface Chamado {
  NUCHAMADO: number;
  DESCRCHAMADO: string | null;
  STATUS: 'P' | 'E' | 'S' | 'A' | 'C' | 'F';
  PRIORIDADE: 'A' | 'M' | 'B' | null;
  TIPOCHAMADO: string | null;
  DHCHAMADO: string | null;
  DHFINCHAM: string | null;
  DHPREVENTREGA: string | null;
  DHVALIDACAO: string | null;
  DHALTER: string | null;
  SOLICITANTE: number | null;
  SOLICITADO: number | null;
  FINALIZADOPOR: number | null;
  VALIDADOPOR: number | null;
  CODUSUALTER: number | null;
  CODPARC: number | null;
  SETOR: string | null;
  NOMEPARC: string | null;
  NOMESOLICITANTE: string | null;
  CODPARCSOLICITANTE: number | null;
  NOMEATRIBUIDO: string | null;
  CODPARCATRIBUIDO: number | null;
  NOMEFINALIZADOR: string | null;
  CODPARCFINALIZADOR: number | null;
  NOMEALTERADOR: string | null;
  CODPARCALTERADOR: number | null;
  NOMEVALIDADOR: string | null;
  CODPARCVALIDADOR: number | null;
  TEM_ANEXO: number;
}

export interface ChamadoResumo {
  porStatus: { status: string; label: string; total: number }[];
  porPrioridade: { prioridade: string; label: string; total: number }[];
  porTipo: { tipoChamado: string; total: number }[];
  total: number;
}

export interface ChamadoOcorrencia {
  NUCHAMADO: number;
  SEQUENCIA: number;
  DESCROCORRENCIA: string | null;
  DHOCORRENCIA: string | null;
  ATENDENTE: number | null;
  NOMEATENDENTE: string | null;
  CODPARCATENDENTE: number | null;
}

export interface KanbanColumn {
  status: string;
  label: string;
  color: 'warning' | 'info' | 'default' | 'secondary' | 'success' | 'error';
  ordem: number;
  chamados: Chamado[];
}

export interface SetorResumo {
  SETOR: string | null;
  TOTAL: number;
  FINALIZADOS: number;
  ATIVOS: number;
}

export interface ChamadoAnexo {
  NUATTACH: number;
  NOMEARQUIVO: string;
  DESCRICAO: string | null;
  CHAVEARQUIVO: string | null;
  DHCAD: string;
  DHALTER: string;
  LINK: string | null;
  TIPOAPRES: string;
  TIPOACESSO: string;
  NOMEINSTANCIA: string;
  PKREGISTRO: string;
  NOMEUPLOADER: string | null;
  CODPARCUPLOADER: number | null;
  DOWNLOAD_URL: string | null;
}

export type ChamadoStatusCode = Chamado['STATUS'];
export type ChamadoPrioridadeCode = NonNullable<Chamado['PRIORIDADE']>;

export interface MutationResult {
  foiSucesso: boolean;
  sucesso: boolean;
  registrosAfetados: number;
  mensagem: string;
}

export interface UpdateChamadoPayload {
  DESCRCHAMADO?: string;
  STATUS?: ChamadoStatusCode;
  PRIORIDADE?: ChamadoPrioridadeCode;
  SOLICITADO?: number;
  DHPREVENTREGA?: string;
}

export interface UpdateStatusPayload {
  status: ChamadoStatusCode;
  codUsu?: number;
}

export interface CreateChamadoPayload {
  DESCRCHAMADO: string;
  STATUS?: ChamadoStatusCode;
  PRIORIDADE?: ChamadoPrioridadeCode;
  TIPOCHAMADO?: string;
  SOLICITANTE: number;
  SOLICITADO?: number;
  CODPARC?: number;
  DHPREVENTREGA?: string;
  SETOR?: string;
  FINALIZADOPOR?: number;
  DHFINCHAM?: string;
  DHCHAMADO?: string;
  VALIDADOPOR?: number;
  DHVALIDACAO?: string;
  VALIDADO?: 'S' | 'N';
}

export interface AddOcorrenciaPayload {
  DESCROCORRENCIA: string;
  CODUSU?: number;
}

export interface ChamadoUsuario {
  CODUSU: number;
  NOMEUSU: string;
  CODPARC: number | null;
}

export interface ChamadosListParams {
  page?: number;
  limit?: number;
  status?: string;
  prioridade?: string;
  tipoChamado?: string;
  codparc?: number;
  solicitante?: number;
  solicitado?: number;
  dataInicio?: string;
  dataFim?: string;
  orderBy?: string;
  orderDir?: 'ASC' | 'DESC';
}
