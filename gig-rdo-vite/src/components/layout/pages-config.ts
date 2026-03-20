import { Home, ListAlt, Assessment, AccessTime, EventAvailable, People, Person,
  Category, Science, Timeline, AccountTree, Login, ViewList, Description,
  BuildCircle, Storage, Security, Build, TrendingDown, School, Dashboard,
  Handyman, PendingActions, CheckCircle, VpnKey, SupportAgent, BadgeRounded,
  MeetingRoom, Inventory, DirectionsCar, Speed, AccountBalance, LocalShipping,
} from '@mui/icons-material';
import type { SvgIconComponent } from '@mui/icons-material';

export interface PageConfig {
  path: string;
  label: string;
  icon: SvgIconComponent;
  description?: string;
  subtitle?: string;
  iconColor?: 'primary' | 'secondary' | 'warning' | 'success' | 'error' | 'info';
  nav?: boolean;
  parent?: string;
  group?: string;
  keywords?: string[];
}

export const pagesConfig: PageConfig[] = [
  // Principal
  {
    path: '/', label: 'Home', icon: Home,
    description: 'Pagina inicial', subtitle: 'Acesso rapido aos modulos',
    iconColor: 'primary', nav: true, group: 'Principal',
  },
  // Operacional (RDO)
  {
    path: '/manutencao/rdo', label: 'RDOs', icon: ListAlt,
    description: 'Lista de RDOs com treemap e filtros',
    subtitle: 'Relatorios Diarios de Obra',
    iconColor: 'success', nav: true, group: 'Operacional',
    keywords: ['relatorio', 'diario', 'obra', 'apontamento', 'manutencao', 'treemap'],
  },
  {
    path: '/manutencao/rdo/v1', label: 'RDOs V1', icon: ViewList,
    description: 'Versao alternativa da lista de RDOs',
    subtitle: 'Layout alternativo',
    iconColor: 'success', parent: '/manutencao/rdo', group: 'Operacional',
    keywords: ['rdo', 'lista', 'v1', 'alternativo'],
  },
  {
    path: '/rdo', label: 'RDOs (atalho)', icon: ListAlt,
    description: 'Atalho direto para lista de RDOs',
    subtitle: 'Mesmo conteudo de /manutencao/rdo',
    iconColor: 'success', group: 'Operacional',
    keywords: ['rdo', 'atalho'],
  },
  {
    path: '/manutencao/rdo/:codrdo', label: 'Detalhe RDO', icon: Description,
    description: 'Detalhes de um RDO especifico',
    subtitle: 'Visualizacao detalhada',
    iconColor: 'success', parent: '/manutencao/rdo', group: 'Operacional',
  },
  {
    path: '/rdo/:codrdo', label: 'Detalhe RDO (atalho)', icon: Description,
    description: 'Atalho direto para detalhe do RDO',
    iconColor: 'success', parent: '/rdo', group: 'Operacional',
  },
  // Analises
  {
    path: '/rdo/analytics', label: 'Analytics', icon: Assessment,
    description: 'Produtividade, eficiencia e rankings',
    subtitle: 'Metricas e rankings de produtividade',
    iconColor: 'primary', nav: true, group: 'Analises',
    keywords: ['metricas', 'graficos', 'ranking', 'produtividade'],
  },
  {
    path: '/rdo/analytics/hora-extra', label: 'Hora Extra', icon: AccessTime,
    description: 'Analise e alertas de hora extra',
    subtitle: 'Horas extras por periodo',
    iconColor: 'warning', parent: '/rdo/analytics', group: 'Analises',
    keywords: ['overtime', 'excedente'],
  },
  {
    path: '/rdo/analytics/assiduidade', label: 'Assiduidade', icon: EventAvailable,
    description: 'Taxa de presenca e frequencia',
    subtitle: 'Frequencia dos colaboradores',
    iconColor: 'info', parent: '/rdo/analytics', group: 'Analises',
    keywords: ['presenca', 'falta', 'frequencia'],
  },
  {
    path: '/rdo/wrench-time', label: 'Wrench Time', icon: Build,
    description: 'Eficiencia real da manutencao',
    subtitle: 'Tempo produtivo vs perdas',
    iconColor: 'success', nav: true, group: 'Analises',
    keywords: ['wrench', 'time', 'eficiencia', 'perda', 'produtivo', 'ferramenta'],
  },
  {
    path: '/rdo/wrench-time/perdas', label: 'Analise de Perdas', icon: TrendingDown,
    description: 'Detalhamento por categoria de perda',
    subtitle: 'Onde esta o desperdicio',
    iconColor: 'warning', parent: '/rdo/wrench-time', group: 'Analises',
    keywords: ['perda', 'desperdicio', 'categoria', 'wrench'],
  },
  {
    path: '/rdo/wrench-time/colaboradores', label: 'WT Colaboradores', icon: People,
    description: 'Ranking de colaboradores por Wrench Time',
    subtitle: 'Quem produz mais',
    iconColor: 'success', parent: '/rdo/wrench-time', group: 'Analises',
    keywords: ['ranking', 'colaborador', 'wrench', 'time'],
  },
  {
    path: '/rdo/wrench-time/tendencia', label: 'WT Tendencia', icon: Timeline,
    description: 'Evolucao do Wrench Time ao longo do tempo',
    subtitle: 'Tendencia diaria com media movel',
    iconColor: 'info', parent: '/rdo/wrench-time', group: 'Analises',
    keywords: ['tendencia', 'evolucao', 'trend', 'wrench', 'time'],
  },
  {
    path: '/rdo/wrench-time/dia/:dtref', label: 'WT Detalhe do Dia', icon: Build,
    description: 'Detalhamento de Wrench Time para um dia especifico',
    subtitle: 'KPIs, perdas e ranking do dia',
    iconColor: 'success', parent: '/rdo/wrench-time', group: 'Analises',
    keywords: ['wrench', 'time', 'dia', 'detalhe', 'diario'],
  },
  {
    path: '/rdo/wrench-time/dia/:dtref/colab/:codparc', label: 'WT Colaborador no Dia', icon: People,
    description: 'Detalhamento de Wrench Time de um colaborador em um dia especifico',
    subtitle: 'Atividades, meta e jornada do dia',
    iconColor: 'success', parent: '/rdo/wrench-time', group: 'Analises',
    keywords: ['wrench', 'time', 'colaborador', 'dia', 'atividade', 'detalhe'],
  },
  {
    path: '/rdo/wrench-time/estudo', label: 'Estudo de Produtividade', icon: School,
    description: 'Fator de Produtividade — Visao Academica com benchmarks',
    subtitle: 'Classificacao academica e benchmarks internacionais',
    iconColor: 'primary', parent: '/rdo/wrench-time', group: 'Analises',
    keywords: ['estudo', 'produtividade', 'fator', 'academico', 'benchmark', 'world class'],
  },
  // Pessoas
  {
    path: '/rdo/colaborador', label: 'Colaboradores', icon: People,
    description: 'Busca e timeline individual',
    subtitle: 'Buscar colaborador para ver timeline',
    iconColor: 'secondary', nav: true, group: 'Pessoas',
    keywords: ['funcionario', 'timeline', 'individual'],
  },
  {
    path: '/rdo/colaborador/:codparc', label: 'Timeline', icon: Timeline,
    description: 'Timeline do colaborador',
    subtitle: 'Detalhes do colaborador',
    iconColor: 'secondary', parent: '/rdo/colaborador', group: 'Pessoas',
  },
  {
    path: '/funcionarios', label: 'Funcionarios', icon: BadgeRounded,
    description: 'Grid completo de funcionarios',
    subtitle: 'Lista, filtros, perfil e historico',
    iconColor: 'primary', nav: true, group: 'Pessoas',
    keywords: ['funcionario', 'colaborador', 'rh', 'grid', 'lista'],
  },
  {
    path: '/funcionarios/:codparc', label: 'Detalhe Funcionario', icon: People,
    description: 'Perfil completo do funcionario',
    iconColor: 'primary', parent: '/funcionarios', group: 'Pessoas',
  },
  // Operacional - Armarios
  {
    path: '/armarios', label: 'Armarios', icon: MeetingRoom,
    description: 'Gestao de armarios com etiquetas e QR Code',
    subtitle: 'Lista, filtros e impressao em lote',
    iconColor: 'success', nav: true, group: 'Operacional',
    keywords: ['armario', 'cadeado', 'etiqueta', 'qr', 'locker'],
  },
  // Manutencao - Hub
  {
    path: '/manutencao', label: 'Manutencao', icon: Build,
    description: 'Hub de Ordens de Servico e Manutencao de Frota',
    subtitle: 'Navegacao para sub-modulos de manutencao',
    iconColor: 'warning', nav: true, group: 'Operacional',
    keywords: ['manutencao', 'os', 'ordem', 'servico', 'frota', 'veiculo', 'hub'],
  },
  // Manutencao - OS
  {
    path: '/manutencao/ordens-de-servico', label: 'Ordens de Servico', icon: Build,
    description: 'Lista e filtros de Ordens de Servico',
    subtitle: 'Visualizar OS por periodo, status, veiculo e executor',
    iconColor: 'warning', nav: true, group: 'Operacional', parent: '/manutencao',
    keywords: ['os', 'ordem', 'servico', 'manutencao', 'corretiva', 'preventiva', 'veiculo'],
  },
  {
    path: '/manutencao/servicos-executor', label: 'Servicos por Executor', icon: Build,
    description: 'Servicos executados por colaborador',
    subtitle: 'Ver OS em que o colaborador atuou como executante',
    iconColor: 'info', nav: true, group: 'Operacional', parent: '/manutencao',
    keywords: ['executor', 'servico', 'colaborador', 'os', 'manutencao', 'tempo'],
  },
  {
    path: '/manutencao/dashboard', label: 'Dashboard Manutencao', icon: Dashboard,
    description: 'KPIs, MTTR, MTBF e distribuicao por status e tipo',
    subtitle: 'Indicadores de manutencao da frota',
    iconColor: 'warning', nav: true, group: 'Operacional', parent: '/manutencao',
    keywords: ['dashboard', 'kpi', 'mttr', 'mtbf', 'manutencao', 'indicador', 'status', 'tipo'],
  },
  {
    path: '/manutencao/os/:nuos', label: 'Detalhe da OS', icon: Description,
    description: 'Detalhes completos de uma Ordem de Servico',
    subtitle: 'Header, servicos, timeline e observacoes',
    iconColor: 'warning', parent: '/manutencao', group: 'Operacional',
    keywords: ['os', 'ordem', 'servico', 'detalhe', 'manutencao'],
  },
  {
    path: '/manutencao/veiculo/:codveiculo', label: 'Historico do Veiculo', icon: Timeline,
    description: 'Historico de manutencao do veiculo com KPIs',
    subtitle: 'MTTR, MTBF, disponibilidade e timeline de OS',
    iconColor: 'info', parent: '/manutencao', group: 'Operacional',
    keywords: ['veiculo', 'historico', 'manutencao', 'mttr', 'mtbf', 'kpi', 'timeline'],
  },
  {
    path: '/manutencao/executores/ranking', label: 'Ranking de Executores', icon: People,
    description: 'Ranking de executores por taxa de conclusao, tempo medio e volume',
    subtitle: 'Comparativo de desempenho entre executores',
    iconColor: 'info', nav: true, group: 'Operacional', parent: '/manutencao',
    keywords: ['executor', 'ranking', 'desempenho', 'conclusao', 'tempo', 'comparativo', 'manutencao'],
  },
  {
    path: '/manutencao/analise-tipo-veiculo', label: 'Analise por Tipo', icon: Assessment,
    description: 'Tempo de execucao de OS agrupado por tipo de equipamento',
    subtitle: 'Media, min e max de execucao por categoria de veiculo',
    iconColor: 'warning', nav: true, group: 'Operacional', parent: '/manutencao',
    keywords: ['analise', 'tipo', 'veiculo', 'equipamento', 'tempo', 'execucao', 'os', 'categoria'],
  },
  // Manutencao - Apontamentos
  {
    path: '/manutencao/apontamentos', label: 'Apontamentos', icon: Handyman,
    description: 'Dashboard de apontamentos de solicitacao de servicos',
    subtitle: 'Servicos frequentes, produtos e veiculos',
    iconColor: 'warning', nav: true, group: 'Operacional', parent: '/manutencao',
    keywords: ['apontamento', 'solicitacao', 'servico', 'pendente', 'os', 'produto'],
  },
  {
    path: '/manutencao/apontamentos/pendentes', label: 'Pendentes sem OS', icon: PendingActions,
    description: 'Servicos que geram OS mas ainda nao tem OS criada',
    subtitle: 'Pendencias de abertura de OS',
    iconColor: 'warning', parent: '/manutencao/apontamentos', group: 'Operacional',
    keywords: ['pendente', 'sem os', 'apontamento', 'solicitacao'],
  },
  {
    path: '/manutencao/apontamentos/com-os', label: 'Com OS', icon: CheckCircle,
    description: 'Servicos de apontamento que geraram Ordem de Servico',
    subtitle: 'Apontamentos vinculados a OS',
    iconColor: 'success', parent: '/manutencao/apontamentos', group: 'Operacional',
    keywords: ['com os', 'apontamento', 'vinculado', 'ordem'],
  },
  {
    path: '/manutencao/apontamentos/veiculo/:codveiculo', label: 'Timeline Veiculo', icon: Timeline,
    description: 'Historico cronologico de servicos apontados para um veiculo',
    subtitle: 'Todos os apontamentos do veiculo',
    iconColor: 'info', parent: '/manutencao/apontamentos', group: 'Operacional',
    keywords: ['timeline', 'veiculo', 'apontamento', 'historico'],
  },
  {
    path: '/manutencao/apontamentos/:codigo', label: 'Detalhe Apontamento', icon: Description,
    description: 'Servicos de um apontamento especifico',
    subtitle: 'Detalhe com lista de servicos',
    iconColor: 'warning', parent: '/manutencao/apontamentos', group: 'Operacional',
    keywords: ['apontamento', 'detalhe', 'servico'],
  },
  // Manutencao - Servicos Grupo
  {
    path: '/manutencao/servicos-grupo', label: 'Arvore de Servicos', icon: Category,
    description: 'Grupos hierarchicos de servicos de manutencao',
    subtitle: 'Visualizar servicos por grupo e categoria',
    iconColor: 'info', nav: true, group: 'Operacional', parent: '/manutencao',
    keywords: ['servico', 'grupo', 'arvore', 'categoria', 'manutencao', 'hierarquia'],
  },
  // Manutencao - Locais
  {
    path: '/locais', label: 'Locais e Produtos', icon: Inventory,
    description: 'Locais hierarchicos com produtos asociados',
    subtitle: 'Visualizar produtos por local e categoria',
    iconColor: 'info', nav: true, group: 'Operacional',
    keywords: ['local', 'produto', 'estoque', 'armazen', 'hierarquia'],
  },
  // TI
  {
    path: '/ti/chamados', label: 'Chamados TI', icon: SupportAgent,
    description: 'Kanban e lista de chamados de TI',
    subtitle: 'Chamados, tickets e suporte interno',
    iconColor: 'info', nav: true, group: 'TI',
    keywords: ['chamado', 'ticket', 'ti', 'suporte', 'kanban', 'helpdesk'],
  },
  {
    path: '/ti/chamados/:nuchamado', label: 'Detalhe Chamado', icon: Description,
    description: 'Detalhes e timeline de um chamado',
    iconColor: 'info', parent: '/ti/chamados', group: 'TI',
  },
  {
    path: '/ti/chamados/por-setor', label: 'Chamados por Setor', icon: AccountTree,
    description: 'Distribuicao de chamados por setor',
    iconColor: 'info', parent: '/ti/chamados', group: 'TI',
    keywords: ['setor', 'departamento', 'distribuicao', 'chamado'],
  },
  // Veiculos
  {
    path: '/veiculos', label: 'Veiculos', icon: DirectionsCar,
    description: 'Frota completa com monitoramento, filtros e detalhes',
    subtitle: 'Lista, KPIs, status e perfil por veiculo',
    iconColor: 'warning', nav: true, group: 'Operacional',
    keywords: ['veiculo', 'frota', 'placa', 'equipamento', 'monitoramento', 'status', 'lista'],
  },
  {
    path: '/veiculos/:codveiculo', label: 'Detalhe Veiculo', icon: DirectionsCar,
    description: 'Perfil completo do veiculo com 11 abas',
    subtitle: 'Identificacao, OS, contratos, abastecimentos, consumo e mais',
    iconColor: 'warning', parent: '/veiculos', group: 'Operacional',
    keywords: ['veiculo', 'detalhe', 'perfil', 'manutencao', 'abastecimento', 'consumo'],
  },
  {
    path: '/veiculos/acompanhamento', label: 'Preventivas', icon: BuildCircle,
    description: 'Quadro de manutencoes preventivas da frota',
    subtitle: 'Acompanhamento A/B/C1/C2 por veiculo',
    iconColor: 'warning', parent: '/veiculos', group: 'Operacional',
    keywords: ['veiculo', 'preventiva', 'manutencao', 'frota', 'quadro', 'acompanhamento'],
  },
  // Patrimonio
  {
    path: '/patrimonio', label: 'Patrimonio', icon: AccountBalance,
    description: 'Gestao patrimonial - Mobilizado vs Imobilizado',
    subtitle: 'Bens, depreciacao, contratos e mobilizacao',
    iconColor: 'primary', nav: true, group: 'Operacional',
    keywords: ['patrimonio', 'imobilizado', 'mobilizado', 'bem', 'depreciacao', 'ativo', 'contrato', 'guindaste', 'caminhao'],
  },
  {
    path: '/patrimonio/bem/:codbem', label: 'Detalhe do Bem', icon: Inventory,
    description: 'Perfil completo do bem patrimonial',
    iconColor: 'primary', parent: '/patrimonio', group: 'Operacional',
  },
  {
    path: '/patrimonio/mobilizacao', label: 'Mobilizacao', icon: LocalShipping,
    description: 'Veiculos mobilizados em clientes',
    iconColor: 'warning', parent: '/patrimonio', group: 'Operacional',
    keywords: ['mobilizado', 'contrato', 'cliente', 'alocacao'],
  },
  {
    path: '/patrimonio/depreciacao', label: 'Depreciacao', icon: TrendingDown,
    description: 'Analise de depreciacao patrimonial',
    iconColor: 'error', parent: '/patrimonio', group: 'Operacional',
    keywords: ['depreciacao', 'valor', 'contabil', 'saldo'],
  },
  {
    path: '/patrimonio/categorias', label: 'Categorias', icon: Category,
    description: 'Analise por categoria de equipamento',
    iconColor: 'info', parent: '/patrimonio', group: 'Operacional',
    keywords: ['categoria', 'guindaste', 'caminhao', 'empilhadeira'],
  },
  // Dados
  {
    path: '/rdo/motivos', label: 'Motivos', icon: Category,
    description: 'Distribuicao de atividades',
    subtitle: 'Atividades produtivas vs improdutivas',
    iconColor: 'primary', nav: true, group: 'Dados',
    keywords: ['atividade', 'produtiva', 'improdutiva', 'sigla'],
  },
  // Em Tempo Real
  {
    path: '/em-tempo-real', label: 'Em Tempo Real', icon: Speed,
    description: 'Movimentacoes de notas e documentos em tempo real',
    subtitle: 'TGFVAR/TGFCAB - auto refresh 15s',
    iconColor: 'error', nav: true, group: 'Operacional',
    keywords: ['tempo real', 'nota', 'documento', 'movimentacao', 'cab', 'var', 'estoque', 'live'],
  },
  // Database
  {
    path: '/database', label: 'Database', icon: Storage,
    description: 'Gerenciador de banco de dados',
    subtitle: 'Query editor, monitor, tabelas, objetos e dicionario',
    iconColor: 'info', nav: true, group: 'Dados',
    keywords: ['banco', 'sql', 'query', 'tabela', 'view', 'procedure', 'trigger', 'dicionario', 'dbms'],
  },
  // Configuracao
  {
    path: '/permissoes', label: 'Permissoes', icon: Security,
    description: 'Painel RBAC de permissoes do Sankhya',
    subtitle: 'Telas, grupos e usuarios com acesso',
    iconColor: 'warning', nav: true, group: 'Configuracao',
    keywords: ['permissao', 'rbac', 'acesso', 'grupo', 'tela', 'seguranca', 'security'],
  },
  // Seguranca
  {
    path: '/seguranca/password-generator', label: 'Gerador de Senha', icon: VpnKey,
    description: 'Gerar hash MD5 e SQL UPDATE para reset de senha Sankhya',
    subtitle: 'Ferramenta administrativa de senha TSIUSU',
    iconColor: 'warning', nav: true, group: 'Configuracao',
    keywords: ['senha', 'password', 'hash', 'md5', 'tsiusu', 'reset', 'gerador'],
  },
  // Autenticacao
  {
    path: '/login', label: 'Login', icon: Login,
    description: 'Autenticacao no sistema',
    subtitle: 'Acesso ao sistema',
    iconColor: 'info', group: 'Sistema',
    keywords: ['login', 'autenticacao', 'entrar', 'senha'],
  },
  // Sistema
  {
    path: '/poc-charts', label: 'POC Charts', icon: Science,
    description: 'Comparacao de bibliotecas de graficos',
    subtitle: 'Recharts vs ECharts vs Nivo',
    iconColor: 'info', group: 'Sistema',
    keywords: ['grafico', 'chart', 'poc'],
  },
  {
    path: '/sitemap', label: 'Mapa do Site', icon: AccountTree,
    description: 'Todas as paginas organizadas por modulo',
    subtitle: 'Navegacao completa do sistema',
    iconColor: 'info', group: 'Sistema',
    keywords: ['sitemap', 'mapa', 'paginas', 'navegacao', 'indice'],
  },
  {
    path: '/me', label: 'Meu Perfil', icon: Person,
    description: 'Dados do usuario, token JWT e sessao',
    subtitle: 'Informacoes da conta e sessao ativa',
    iconColor: 'primary', group: 'Sistema',
    keywords: ['perfil', 'usuario', 'token', 'jwt', 'sessao', 'conta', 'me'],
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
