import { AdComadm } from './ad-comadm';

export interface KanbanColumn {
  status: string;
  label: string;
  color: 'warning' | 'info' | 'default' | 'secondary' | 'success' | 'error';
  ordem: number;
  chamados: AdComadm[];
  total: number;
}
