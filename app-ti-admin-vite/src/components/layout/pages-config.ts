import {
  Home, People, Lock, CompareArrows, Search, Map, Person,
} from '@mui/icons-material';
import type { SvgIconComponent } from '@mui/icons-material';

export interface PageConfig {
  path: string;
  label: string;
  icon: SvgIconComponent;
  description?: string;
  group: string;
  parent?: string;
  adminOnly?: boolean;
  hidden?: boolean;
}

export const pagesConfig: PageConfig[] = [
  {
    path: '/',
    label: 'Dashboard',
    icon: Home,
    description: 'Visao geral de permissoes e usuarios',
    group: 'Principal',
  },
  {
    path: '/usuarios',
    label: 'Usuarios',
    icon: People,
    description: 'Lista de usuarios do Sankhya',
    group: 'Gestao',
  },
  {
    path: '/permissoes',
    label: 'Permissoes',
    icon: Lock,
    description: 'Gerenciar permissoes por recurso',
    group: 'Gestao',
  },
  {
    path: '/comparar',
    label: 'Comparar',
    icon: CompareArrows,
    description: 'Comparar permissoes entre usuarios',
    group: 'Ferramentas',
  },
  {
    path: '/investigar',
    label: 'Investigar',
    icon: Search,
    description: 'Investigar documentos e registros',
    group: 'Ferramentas',
  },
  {
    path: '/perfil',
    label: 'Perfil',
    icon: Person,
    description: 'Dados do usuario logado',
    group: 'Sistema',
  },
  {
    path: '/sitemap',
    label: 'Mapa do App',
    icon: Map,
    description: 'Todas as telas disponiveis',
    group: 'Sistema',
  },
];
