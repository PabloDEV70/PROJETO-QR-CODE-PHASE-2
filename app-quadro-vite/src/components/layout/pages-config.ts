import {
  Dashboard, ViewQuilt, ListAlt, PersonAdd, History, People, Settings,
  DirectionsCar, AccountTree, FlightTakeoff, Assignment, PrecisionManufacturing,
  ViewKanban, Schema,
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
    description: 'Visao geral da frota com KPIs',
    group: 'Principal',
    keywords: ['home', 'inicio', 'kpi', 'metricas', 'resumo'],
  },
  {
    path: '/quadro', label: 'Quadro', icon: ViewQuilt,
    description: 'Quadro interativo de veiculos por departamento',
    group: 'Principal',
    keywords: ['quadro', 'board', 'veiculos', 'situacao', 'painel'],
  },
  {
    path: '/veiculos', label: 'Veiculos', icon: ListAlt,
    description: 'Todos os veiculos com situacao ativa',
    group: 'Principal',
    keywords: ['lista', 'tabela', 'placa', 'frota', 'datagrid'],
  },
  {
    path: '/veiculos-status', label: 'Veiculos Status', icon: DirectionsCar,
    description: 'Veiculos com placa visual e detalhes de situacao',
    group: 'Principal',
    keywords: ['veiculo', 'status', 'placa', 'situacao', 'detalhe', 'sidebar'],
  },
  {
    path: '/nova-situacao', label: 'Nova Situacao', icon: PersonAdd,
    description: 'Criar nova situacao para um veiculo',
    group: 'Acoes',
    keywords: ['criar', 'nova', 'adicionar', 'registrar', 'situacao'],
  },
  {
    path: '/registros', label: 'Registros', icon: History,
    description: 'Historico completo de situacoes',
    group: 'Consultas',
    keywords: ['historico', 'registros', 'passado', 'encerrados'],
  },
  {
    path: '/operadores', label: 'Equipe', icon: People,
    description: 'Operadores e mecanicos com atribuicoes',
    group: 'Consultas',
    keywords: ['equipe', 'operadores', 'mecanicos', 'pessoas'],
  },
  {
    path: '/config/situacoes', label: 'Situacoes', icon: Settings,
    description: 'Cadastro de tipos de situacao por departamento',
    group: 'Configuracao',
    keywords: ['situacao', 'config', 'cadastro', 'tipo', 'departamento'],
  },
  {
    path: '/config/prioridades', label: 'Prioridades', icon: Settings,
    description: 'Cadastro de niveis de prioridade',
    group: 'Configuracao',
    keywords: ['prioridade', 'config', 'cadastro', 'urgente', 'alta', 'normal'],
  },
  {
    path: '/painel-aeroporto', label: 'Painel Aeroporto', icon: FlightTakeoff,
    description: 'Visao full-screen estilo aeroporto de saidas e chegadas',
    group: 'Principal',
    keywords: ['aeroporto', 'painel', 'saidas', 'chegadas', 'fullscreen', 'tv', 'monitor'],
  },
  {
    path: '/escala-servicos', label: 'Escala de Servicos', icon: Assignment,
    description: 'Quadro de escala estilo lousa com placa, operador, cliente, local e saida',
    group: 'Principal',
    keywords: ['escala', 'servicos', 'quadro', 'lousa', 'guindaste', 'operador', 'placa', 'fullscreen'],
  },
  {
    path: '/escala-guindastes', label: 'Escala Guindastes', icon: PrecisionManufacturing,
    description: 'Saidas e chegadas de guindastes e guindautos estilo aeroporto',
    group: 'Principal',
    keywords: ['escala', 'guindaste', 'guindauto', 'saida', 'chegada', 'aeroporto', 'fullscreen'],
  },
  {
    path: '/kanban', label: 'Kanban', icon: ViewKanban,
    description: 'Kanban departamental com drag-and-drop',
    group: 'Principal',
    keywords: ['kanban', 'drag', 'arrastar', 'departamento', 'mover', 'situacao'],
  },
  {
    path: '/fluxo', label: 'Fluxo da Frota', icon: AccountTree,
    description: 'Diagrama do ciclo de vida do veiculo na frota',
    group: 'Ajuda',
    keywords: ['fluxo', 'processo', 'ciclo', 'diagrama', 'mermaid'],
  },
  {
    path: '/bpmn', label: 'Processos BPMN', icon: Schema,
    description: 'Todos os processos operacionais mapeados em BPMN',
    group: 'Ajuda',
    keywords: ['bpmn', 'processo', 'manutencao', 'comercial', 'seguranca', 'compras', 'chamados'],
  },
];
