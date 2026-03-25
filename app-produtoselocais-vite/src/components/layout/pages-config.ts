import {
  Dashboard, Warehouse, Inventory,
} from '@mui/icons-material';
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
    path: '/dashboard', label: 'Dashboard', icon: Dashboard,
    description: 'Visao geral de produtos e locais',
    group: 'Principal',
    keywords: ['home', 'inicio', 'kpi', 'resumo'],
  },
  {
    path: '/locais', label: 'Locais e Estoque', icon: Warehouse,
    description: 'Arvore de locais com estoque e detalhes de produtos',
    group: 'Principal',
    keywords: ['locais', 'estoque', 'armazem', 'almoxarifado', 'deposito', 'arvore'],
  },
  {
    path: '/produtos', label: 'Produtos', icon: Inventory,
    description: 'Busca e detalhes de produtos com estoque por local',
    group: 'Principal',
    keywords: ['produto', 'buscar', 'peca', 'material', 'item', 'grupo'],
  },
];
