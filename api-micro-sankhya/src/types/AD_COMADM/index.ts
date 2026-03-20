export { AdComadm } from './ad-comadm';
export { AdComadmResumo } from './ad-comadm-resumo';
export { AdComadmOcorrencia } from './ad-comadm-ocorrencia';
export { KanbanColumn } from './ad-comadm-kanban';
export { ListChamadosOptions, ListChamadosResult, UsuarioChamado } from './list-options';

export interface ChatListItem {
  NUCHAMADO: number;
  STATUS: string;
  PRIORIDADE: string | null;
  TIPOCHAMADO: string | null;
  SETOR: string | null;
  NOMESOLICITANTE: string | null;
  CODPARCSOLICITANTE: number | null;
  DESCRCHAMADO: string | null;
  ULTIMA_ATIVIDADE: string | null;
  ULTIMA_TRATATIVA_TEXTO: string | null;
  ULTIMA_TRATATIVA_AUTOR: string | null;
  TOTAL_OCORRENCIAS: number;
}
