import {
  Dashboard, ListAlt, Description, EventNote, DirectionsCar,
  EmojiTransportation, EmojiEvents, Notifications, Assessment,
  Timer, Build, CompareArrows,
} from '@mui/icons-material';
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
  // Principal
  {
    path: '/', label: 'Dashboard', icon: Dashboard,
    description: 'Visao geral da manutencao',
    nav: true, group: 'Principal',
    keywords: ['home', 'inicio', 'kpi'],
  },
  {
    path: '/ordens-de-servico', label: 'Ordens de Servico', icon: ListAlt,
    description: 'Lista e filtros de OS',
    nav: true, group: 'Principal',
    keywords: ['os', 'ordem', 'servico', 'lista', 'ordens'],
  },
  {
    path: '/ordens-de-servico/:nuos', label: 'Detalhe OS', icon: Description,
    description: 'Detalhes de uma OS',
    parent: '/ordens-de-servico', group: 'Principal',
  },
  {
    path: '/apontamentos', label: 'Apontamentos', icon: Build,
    description: 'Apontamentos de servico',
    nav: true, group: 'Principal',
    keywords: ['apontamento', 'servico', 'solicitacao'],
  },
  // Gestao
  {
    path: '/planos', label: 'Planos Preventivos', icon: EventNote,
    description: 'Planos e aderencia preventiva',
    nav: true, group: 'Gestao',
    keywords: ['plano', 'preventiva', 'aderencia', 'programacao'],
  },
  {
    path: '/frota', label: 'Frota', icon: DirectionsCar,
    description: 'Status operacional da frota',
    nav: true, group: 'Gestao',
    keywords: ['frota', 'veiculo', 'status', 'operacional'],
  },
  {
    path: '/frota/:codveiculo', label: 'Detalhe Veiculo', icon: EmojiTransportation,
    description: 'Dashboard do veiculo',
    parent: '/frota', group: 'Gestao',
  },
  // Analise
  {
    path: '/ranking', label: 'Ranking Executores', icon: EmojiEvents,
    description: 'Produtividade dos tecnicos',
    nav: true, group: 'Analise',
    keywords: ['ranking', 'executor', 'tecnico', 'produtividade'],
  },
  {
    path: '/alertas', label: 'Alertas', icon: Notifications,
    description: 'Alertas e OS criticas',
    nav: true, group: 'Analise',
    keywords: ['alerta', 'critico', 'atraso', 'urgente'],
  },
  {
    path: '/analytics', label: 'Analytics', icon: Assessment,
    description: 'Graficos e analises',
    nav: true, group: 'Analise',
    keywords: ['grafico', 'analise', 'chart', 'metricas'],
  },
  {
    path: '/tempo-servicos', label: 'Tempo de Servicos', icon: Timer,
    description: 'Tempo medio de execucao por tipo, grupo e executor',
    nav: true, group: 'Analise',
    keywords: ['tempo', 'media', 'servico', 'execucao', 'duracao'],
  },
  {
    path: '/performance-servico', label: 'Performance Servico', icon: CompareArrows,
    description: 'Performance de servico por colaborador',
    nav: true, group: 'Analise',
    keywords: ['performance', 'servico', 'colaborador', 'executor', 'comparar'],
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
