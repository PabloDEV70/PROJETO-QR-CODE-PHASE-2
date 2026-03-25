import { Speed, Receipt, TableChart, Search } from '@mui/icons-material';
import type { SvgIconComponent } from '@mui/icons-material';

export interface PageConfig {
  path: string;
  label: string;
  icon: SvgIconComponent;
  description?: string;
  group?: string;
  keywords?: string[];
  parent?: string;
}

export const pagesConfig: PageConfig[] = [
  {
    path: '/em-tempo-real', label: 'Em Tempo Real', icon: Speed,
    description: 'Movimentacoes de notas e documentos em tempo real',
    group: 'Principal',
    keywords: ['tempo real', 'nota', 'documento', 'movimentacao', 'cab', 'var', 'estoque', 'live'],
  },
  {
    path: '/por-top', label: 'CABS por TOP', icon: TableChart,
    description: 'Movimentacoes agrupadas por tipo de operacao',
    group: 'Principal',
    keywords: ['top', 'tipo operacao', 'tabela', 'grid', 'datagrid'],
  },
  {
    path: '/cab', label: 'Rastreio de Documento', icon: Search,
    description: 'Investigacao completa: cabecalho, itens, lixeira, auditoria, cotacao, liberacoes',
    group: 'Principal',
    keywords: ['rastreio', 'investigacao', 'detalhe', 'lixeira', 'auditoria', 'excluido', 'cab', 'nunota'],
  },
  {
    path: '/cab/:nunota', label: 'Detalhe da Nota', icon: Receipt,
    description: 'Detalhamento completo de uma nota',
    group: 'Principal',
    parent: '/cab',
  },
];
