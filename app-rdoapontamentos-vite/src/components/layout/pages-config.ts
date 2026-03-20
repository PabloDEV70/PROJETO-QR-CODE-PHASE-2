import {
  Home, History, Article, AdminPanelSettings, Category,
  Map, Login, Person, Build, Timeline,
  Visibility, Analytics, Groups, TrendingDown, ShowChart,
  CalendarToday, PersonSearch, PlaylistAddCheck, NoteAdd, CloudOff,
  Science,
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
  /** Hidden from nav menu (e.g. detail pages with :params) */
  hidden?: boolean;
}

export const pagesConfig: PageConfig[] = [
  // ── Apontamentos ──
  {
    path: '/',
    label: 'Hoje',
    icon: Home,
    description: 'RDO do dia — apontamentos e resumo',
    group: 'Apontamentos',
  },
  {
    path: '/meus-rdos',
    label: 'Historico',
    icon: History,
    description: 'Meus RDOs anteriores',
    group: 'Apontamentos',
  },
  {
    path: '/rdo/:codrdo',
    label: 'Detalhe RDO',
    icon: Article,
    description: 'Detalhes de um RDO especifico',
    group: 'Apontamentos',
    parent: '/meus-rdos',
    hidden: true,
  },
  {
    path: '/escolher-atividade',
    label: 'Escolher Atividade',
    icon: PlaylistAddCheck,
    description: 'Selecionar atividade para apontar no RDO',
    group: 'Apontamentos',
    parent: '/',
    hidden: true,
  },
  {
    path: '/atividade-form',
    label: 'Formulario Atividade',
    icon: NoteAdd,
    description: 'Preencher dados de uma atividade do RDO',
    group: 'Apontamentos',
    parent: '/',
    hidden: true,
  },

  // ── Desempenho ──
  {
    path: '/meu-wrench-time',
    label: 'Meu Wrench Time',
    icon: Build,
    description: 'Sua eficiencia pessoal — produtivo x improdutivo',
    group: 'Desempenho',
  },
  {
    path: '/wrench-time',
    label: 'Wrench Time Geral',
    icon: Timeline,
    description: 'Eficiencia da equipe — KPIs, perdas, ranking',
    group: 'Desempenho',
    adminOnly: true,
  },
  {
    path: '/wrench-time/estudo',
    label: 'Estudo Wrench Time',
    icon: Science,
    description: 'Analise detalhada por periodo — graficos e metricas',
    group: 'Desempenho',
    adminOnly: true,
    parent: '/wrench-time',
  },
  {
    path: '/wrench-time/colaboradores',
    label: 'Colaboradores WT',
    icon: Groups,
    description: 'Ranking e comparativo de eficiencia por colaborador',
    group: 'Desempenho',
    adminOnly: true,
    parent: '/wrench-time',
  },
  {
    path: '/wrench-time/perdas',
    label: 'Perdas WT',
    icon: TrendingDown,
    description: 'Analise de perdas — motivos improdutivos e pareto',
    group: 'Desempenho',
    adminOnly: true,
    parent: '/wrench-time',
  },
  {
    path: '/wrench-time/tendencia',
    label: 'Tendencia WT',
    icon: ShowChart,
    description: 'Evolucao temporal — tendencias e sazonalidade',
    group: 'Desempenho',
    adminOnly: true,
    parent: '/wrench-time',
  },
  {
    path: '/wrench-time/dia/:dtref',
    label: 'Dia WT',
    icon: CalendarToday,
    description: 'Detalhamento de um dia especifico',
    group: 'Desempenho',
    adminOnly: true,
    parent: '/wrench-time',
    hidden: true,
  },
  {
    path: '/wrench-time/dia/:dtref/colab/:codparc',
    label: 'Colaborador Dia WT',
    icon: PersonSearch,
    description: 'Timeline de atividades de um colaborador em um dia',
    group: 'Desempenho',
    adminOnly: true,
    parent: '/wrench-time',
    hidden: true,
  },

  // ── Administracao ──
  {
    path: '/admin',
    label: 'Painel Admin',
    icon: AdminPanelSettings,
    description: 'Estatisticas e grid de todos os RDOs',
    group: 'Administracao',
    adminOnly: true,
  },
  {
    path: '/admin/rdo/novo',
    label: 'Novo RDO',
    icon: Article,
    description: 'Criar novo RDO de apontamentos',
    group: 'Administracao',
    adminOnly: true,
    parent: '/admin',
    hidden: true,
  },
  {
    path: '/admin/rdo/:codrdo',
    label: 'Editar RDO',
    icon: Article,
    description: 'Editar cabecalho e atividades de um RDO',
    group: 'Administracao',
    adminOnly: true,
    parent: '/admin',
    hidden: true,
  },
  {
    path: '/admin/motivos',
    label: 'Motivos RDO',
    icon: Category,
    description: 'CRUD de motivos/atividades do RDO',
    group: 'Administracao',
    adminOnly: true,
    parent: '/admin',
  },
  {
    path: '/admin/motivo/:id',
    label: 'Editar Motivo',
    icon: Category,
    description: 'Criar ou editar um motivo de RDO',
    group: 'Administracao',
    adminOnly: true,
    parent: '/admin/motivos',
    hidden: true,
  },
  {
    path: '/admin/visualizar-como',
    label: 'Visualizar Como',
    icon: Visibility,
    description: 'Impersonar um colaborador para ver seus dados',
    group: 'Administracao',
    adminOnly: true,
    parent: '/admin',
  },
  {
    path: '/cabs/detalhamento-completo',
    label: 'Detalhamento Documento',
    icon: Article,
    description: 'Investigacao completa de TGFCAB — historico, itens, exclusoes, documentos relacionados',
    group: 'Administracao',
    adminOnly: true,
  },

  // ── Sistema ──
  {
    path: '/perfil',
    label: 'Perfil',
    icon: Person,
    description: 'Dados do usuario e sessao',
    group: 'Sistema',
  },
  {
    path: '/sitemap',
    label: 'Mapa do App',
    icon: Map,
    description: 'Todas as telas disponiveis',
    group: 'Sistema',
  },
  {
    path: '/offline',
    label: 'Offline',
    icon: CloudOff,
    description: 'Pagina exibida quando sem conexao',
    group: 'Sistema',
    hidden: true,
  },
  {
    path: '/login',
    label: 'Login',
    icon: Login,
    description: 'Autenticacao no sistema',
    group: 'Sistema',
    hidden: true,
  },
];
