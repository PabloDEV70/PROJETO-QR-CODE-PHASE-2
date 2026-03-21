import { Dashboard, ShoppingCart, Build, RequestQuote } from '@mui/icons-material';
import type { SvgIconComponent } from '@mui/icons-material';

export interface PageConfig {
  path: string;
  label: string;
  icon: SvgIconComponent;
  description?: string;
  group?: string;
  keywords?: string[];
  nav?: boolean;
  parent?: string;
}

export const pagesConfig: PageConfig[] = [
  {
    path: '/acompanhamento-compras', label: 'Acompanhamento', icon: Dashboard,
    description: 'Dashboard de compras e requisicoes pendentes',
    nav: true, group: 'Principal',
    keywords: ['dashboard', 'compras', 'requisicao', 'pendente', 'acompanhamento'],
  },
  {
    path: '/requisicoes-compras', label: 'Requisicoes Compras', icon: ShoppingCart,
    description: 'Requisicoes de compra pendentes do setor de compras',
    nav: true, group: 'Requisicoes',
    keywords: ['requisicao', 'compra', 'pendente', 'pedido'],
  },
  {
    path: '/requisicoes-manutencao', label: 'Requisicoes Manutencao', icon: Build,
    description: 'Requisicoes de compra pendentes do setor de manutencao',
    nav: true, group: 'Requisicoes',
    keywords: ['requisicao', 'manutencao', 'pendente', 'veiculo'],
  },
  {
    path: '/cotacoes', label: 'Cotacoes', icon: RequestQuote,
    description: 'Cotacoes pendentes e em andamento',
    nav: true, group: 'Cotacoes',
    keywords: ['cotacao', 'fornecedor', 'preco', 'pendente'],
  },
];

export const navPages = pagesConfig.filter((p) => p.nav);

export function getSubpages(parentPath: string): PageConfig[] {
  return pagesConfig.filter((p) => p.parent === parentPath);
}

export function searchPages(query: string): PageConfig[] {
  if (!query || query.length < 2) return [];
  const q = query.toLowerCase();
  return pagesConfig.filter((p) =>
    p.label.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)
    || p.keywords?.some((k) => k.includes(q)));
}
