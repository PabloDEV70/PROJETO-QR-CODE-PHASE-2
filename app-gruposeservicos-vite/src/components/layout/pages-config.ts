import {
  Dashboard, AccountTree, Build, RemoveCircleOutline,
  Description, FolderOpen, EditNote, Speed,
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
    description: 'Visao geral dos grupos e servicos',
    group: 'Principal',
    keywords: ['home', 'inicio', 'kpi', 'metricas'],
  },
  {
    path: '/arvore', label: 'Arvore', icon: AccountTree,
    description: 'Hierarquia interativa de grupos',
    group: 'Principal',
    keywords: ['tree', 'hierarquia', 'grupos', 'estrutura'],
  },
  {
    path: '/servicos', label: 'Servicos', icon: Build,
    description: 'Todos os servicos em tabela',
    group: 'Principal',
    keywords: ['lista', 'tabela', 'datagrid', 'produto'],
  },
  {
    path: '/nao-utilizados', label: 'Nao Utilizados', icon: RemoveCircleOutline,
    description: 'Servicos que nunca foram usados em OS',
    group: 'Analise',
    keywords: ['sem uso', 'inativos', 'limpeza', 'desativar', 'zero'],
  },
  {
    path: '/estudo', label: 'Estudo de Viabilidade', icon: Description,
    description: 'Reclassificacao de servicos por grupos',
    group: 'Analise',
    keywords: ['plano', 'reclassificacao', 'estrategia', 'gestor', 'verbos', 'mecanica'],
  },
  {
    path: '/eficiencia', label: 'Eficiencia', icon: Speed,
    description: 'Analise de eficiencia de execucao de servicos por veiculo e executor',
    group: 'Analise',
    keywords: ['eficiencia', 'performance', 'tempo', 'executor', 'veiculo', 'mecanico', 'duracao'],
  },
  {
    path: '/gerenciar', label: 'Gerenciar', icon: EditNote,
    description: 'CRUD de grupos e servicos (somente TESTE)',
    group: 'Gestao',
    keywords: ['crud', 'gerenciar', 'editar', 'criar', 'mover', 'ativar', 'desativar'],
  },
  {
    path: '/grupo/:codGrupo', label: 'Detalhe do Grupo', icon: FolderOpen,
    description: 'Detalhes e servicos de um grupo',
    parent: '/arvore', group: 'Principal',
  },
];
