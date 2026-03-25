import { Speed, Receipt, TableChart } from '@mui/icons-material';
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
    path: '/em-tempo-real/:nunota', label: 'Detalhe da Nota', icon: Receipt,
    description: 'Cabecalho, itens, TOP e variacoes de uma nota',
    group: 'Principal',
    parent: '/em-tempo-real',
  },
];
