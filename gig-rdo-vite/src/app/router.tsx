import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { AppShell } from '@/components/layout/app-shell';
import { AppShellFull } from '@/components/layout/app-shell-full';
import { ProtectedRoute } from '@/components/layout/protected-route';
import { LoadingSkeleton } from '@/components/shared/loading-skeleton';
import { RouteErrorBoundary } from '@/components/shared/route-error-boundary';
import { LoginPage } from '@/pages/login-page';

const HubHomePage = lazy(() =>
  import('@/pages/hub-home-page').then((m) => ({ default: m.HubHomePage })),
);
const RdoListPage = lazy(() =>
  import('@/pages/rdo-list-page').then((m) => ({ default: m.RdoListPage })),
);
const RdoDetailPage = lazy(() =>
  import('@/pages/rdo-detail-page').then((m) => ({ default: m.RdoDetailPage })),
);
const RdoAnalyticsPage = lazy(() =>
  import('@/pages/rdo-analytics-page').then((m) => ({ default: m.RdoAnalyticsPage })),
);
const RdoHoraExtraPage = lazy(() =>
  import('@/pages/rdo-hora-extra-page').then((m) => ({ default: m.RdoHoraExtraPage })),
);
const RdoAssiduidadePage = lazy(() =>
  import('@/pages/rdo-assiduidade-page').then((m) => ({ default: m.RdoAssiduidadePage })),
);
const ColaboradorSearchPage = lazy(() =>
  import('@/pages/colaborador-search-page').then((m) => ({ default: m.ColaboradorSearchPage })),
);
const ColaboradorTimelinePage = lazy(() =>
  import('@/pages/colaborador-timeline-page').then((m) => ({ default: m.ColaboradorTimelinePage })),
);
const RdoMotivosPage = lazy(() =>
  import('@/pages/rdo-motivos-page').then((m) => ({ default: m.RdoMotivosPage })),
);
const RdoListV1Page = lazy(() =>
  import('@/pages/rdo-list-v1-page').then((m) => ({ default: m.RdoListV1Page })),
);
const PocChartsPage = lazy(() =>
  import('@/pages/poc-charts-page').then((m) => ({ default: m.PocChartsPage })),
);
const TesteFontsPage = lazy(() =>
  import('@/pages/teste-fonts-page').then((m) => ({ default: m.TesteFontsPage })),
);
const SitemapPage = lazy(() =>
  import('@/pages/sitemap-page').then((m) => ({ default: m.SitemapPage })),
);
const VeiculosAcompanhamentoPage = lazy(() =>
  import('@/pages/veiculos-acompanhamento-page')
    .then((m) => ({ default: m.VeiculosAcompanhamentoPage })),
);
const VeiculoListPage = lazy(() =>
  import('@/pages/veiculo-list-page').then((m) => ({ default: m.VeiculoListPage })),
);
const VeiculoDetailPage = lazy(() =>
  import('@/pages/veiculo-detail-page').then((m) => ({ default: m.VeiculoDetailPage })),
);
const DatabasePage = lazy(() =>
  import('@/pages/database-page').then((m) => ({ default: m.DatabasePage })),
);
const PermissoesPage = lazy(() =>
  import('@/pages/permissoes-page').then((m) => ({ default: m.PermissoesPage })),
);
const WrenchTimePage = lazy(() =>
  import('@/pages/wrench-time-page').then((m) => ({ default: m.WrenchTimePage })),
);
const WrenchTimePerdasPage = lazy(() =>
  import('@/pages/wrench-time-perdas-page').then((m) => ({ default: m.WrenchTimePerdasPage })),
);
const WrenchTimeColaboradoresPage = lazy(() =>
  import('@/pages/wrench-time-colaboradores-page')
    .then((m) => ({ default: m.WrenchTimeColaboradoresPage })),
);
const WrenchTimeTendenciaPage = lazy(() =>
  import('@/pages/wrench-time-tendencia-page')
    .then((m) => ({ default: m.WrenchTimeTendenciaPage })),
);
const WrenchTimeEstudoPage = lazy(() =>
  import('@/pages/wrench-time-estudo-page')
    .then((m) => ({ default: m.WrenchTimeEstudoPage })),
);
const WrenchTimeDiaPage = lazy(() =>
  import('@/pages/wrench-time-dia-page')
    .then((m) => ({ default: m.WrenchTimeDiaPage })),
);
const WrenchTimeDiaColabPage = lazy(() =>
  import('@/pages/wrench-time-dia-colab-page')
    .then((m) => ({ default: m.WrenchTimeDiaColabPage })),
);
const OsListPage = lazy(() =>
  import('@/pages/os-list-page').then((m) => ({ default: m.OsListPage })),
);
const OsExecutorPage = lazy(() =>
  import('@/pages/os-executor-page').then((m) => ({ default: m.OsExecutorPage })),
);
const HubManutencaoPage = lazy(() =>
  import('@/pages/hub-manutencao-page').then((m) => ({ default: m.HubManutencaoPage })),
);
const OsDashboardPage = lazy(() =>
  import('@/pages/os-dashboard-page').then((m) => ({ default: m.OsDashboardPage })),
);
const OsDetailPage = lazy(() =>
  import('@/pages/os-detail-page').then((m) => ({ default: m.OsDetailPage })),
);
const ExecutorRankingPage = lazy(() =>
  import('@/pages/executor-ranking-page').then((m) => ({ default: m.ExecutorRankingPage })),
);
const OsAnaliseTipoPage = lazy(() =>
  import('@/pages/os-analise-tipo-page').then((m) => ({ default: m.OsAnaliseTipoPage })),
);
const ApontamentosPage = lazy(() =>
  import('@/pages/apontamentos-page').then((m) => ({ default: m.ApontamentosPage })),
);
const ApontamentosPendentesPage = lazy(() =>
  import('@/pages/apontamentos-pendentes-page')
    .then((m) => ({ default: m.ApontamentosPendentesPage })),
);
const ApontamentosComOsPage = lazy(() =>
  import('@/pages/apontamentos-com-os-page')
    .then((m) => ({ default: m.ApontamentosComOsPage })),
);
const ApontamentosVeiculoPage = lazy(() =>
  import('@/pages/apontamentos-veiculo-page')
    .then((m) => ({ default: m.ApontamentosVeiculoPage })),
);
const ApontamentoDetailPage = lazy(() =>
  import('@/pages/apontamento-detail-page')
    .then((m) => ({ default: m.ApontamentoDetailPage })),
);
const ServicosGrupoPage = lazy(() =>
  import('@/pages/servicos-grupo-page').then((m) => ({ default: m.ServicosGrupoPage })),
);
const LocaisPage = lazy(() =>
  import('@/pages/locais-page').then((m) => ({ default: m.LocaisPage })),
);
const PasswordGeneratorPage = lazy(() =>
  import('@/pages/password-generator-page')
    .then((m) => ({ default: m.PasswordGeneratorPage })),
);
const FuncionarioPublicCardPage = lazy(() =>
  import('@/pages/funcionario-public-card-page')
    .then((m) => ({ default: m.FuncionarioPublicCardPage })),
);
const ArmarioPublicPage = lazy(() =>
  import('@/pages/armario-public-page')
    .then((m) => ({ default: m.ArmarioPublicPage })),
);
const MotivoPublicPage = lazy(() =>
  import('@/pages/motivo-public-page')
    .then((m) => ({ default: m.MotivoPublicPage })),
);
const ArmarioListPage = lazy(() =>
  import('@/pages/armario-list-page')
    .then((m) => ({ default: m.ArmarioListPage })),
);
const EmTempoRealPage = lazy(() =>
  import('@/pages/em-tempo-real-page').then((m) => ({ default: m.EmTempoRealPage })),
);
const EmTempoRealDetailPage = lazy(() =>
  import('@/pages/em-tempo-real-detail-page')
    .then((m) => ({ default: m.EmTempoRealDetailPage })),
);
const NotFoundPage = lazy(() =>
  import('@/pages/not-found-page').then((m) => ({ default: m.NotFoundPage })),
);
const ChamadosPage = lazy(() =>
  import('@/pages/chamados-page').then((m) => ({ default: m.ChamadosPage })),
);
const ChamadoDetailPage = lazy(() =>
  import('@/pages/chamado-detail-page').then((m) => ({ default: m.ChamadoDetailPage })),
);
const ChamadosPorSetorPage = lazy(() =>
  import('@/pages/chamados-por-setor-page').then((m) => ({ default: m.ChamadosPorSetorPage })),
);
const ProfilePage = lazy(() =>
  import('@/pages/profile-page').then((m) => ({ default: m.ProfilePage })),
);
const FuncionariosPage = lazy(() =>
  import('@/pages/funcionarios-page').then((m) => ({ default: m.FuncionariosPage })),
);
const FuncionarioDetailPage = lazy(() =>
  import('@/pages/funcionario-detail-page').then((m) => ({ default: m.FuncionarioDetailPage })),
);
const PatrimonioHubPage = lazy(() =>
  import('@/pages/patrimonio-hub-page').then((m) => ({ default: m.PatrimonioHubPage })),
);
const PatrimonioBemDetailPage = lazy(() =>
  import('@/pages/patrimonio-bem-detail-page').then((m) => ({ default: m.PatrimonioBemDetailPage })),
);
const PatrimonioMobilizacaoPage = lazy(() =>
  import('@/pages/patrimonio-mobilizacao-page').then((m) => ({ default: m.PatrimonioMobilizacaoPage })),
);
const PatrimonioDepreciacaoPage = lazy(() =>
  import('@/pages/patrimonio-depreciacao-page').then((m) => ({ default: m.PatrimonioDepreciacaoPage })),
);
const PatrimonioCategoriasPage = lazy(() =>
  import('@/pages/patrimonio-categorias-page').then((m) => ({ default: m.PatrimonioCategoriasPage })),
);

function Lazy({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<LoadingSkeleton rows={4} height={60} />}>{children}</Suspense>;
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, element: <Lazy><HubHomePage /></Lazy> },
      { path: 'manutencao/rdo', element: <Lazy><RdoListPage /></Lazy> },
      { path: 'manutencao/rdo/v1', element: <Lazy><RdoListV1Page /></Lazy> },
      { path: 'manutencao/rdo/:codrdo', element: <Lazy><RdoDetailPage /></Lazy> },
      { path: 'rdo', element: <Lazy><RdoListPage /></Lazy> },
      { path: 'rdo/:codrdo', element: <Lazy><RdoDetailPage /></Lazy> },
      { path: 'rdo/analytics', element: <Lazy><RdoAnalyticsPage /></Lazy> },
      { path: 'rdo/analytics/hora-extra', element: <Lazy><RdoHoraExtraPage /></Lazy> },
      { path: 'rdo/analytics/assiduidade', element: <Lazy><RdoAssiduidadePage /></Lazy> },
      { path: 'rdo/colaborador', element: <Lazy><ColaboradorSearchPage /></Lazy> },
      { path: 'rdo/colaborador/:codparc', element: <Lazy><ColaboradorTimelinePage /></Lazy> },
      { path: 'rdo/motivos', element: <Lazy><RdoMotivosPage /></Lazy> },
      { path: 'rdo/wrench-time', element: <Lazy><WrenchTimePage /></Lazy> },
      { path: 'rdo/wrench-time/perdas', element: <Lazy><WrenchTimePerdasPage /></Lazy> },
      { path: 'rdo/wrench-time/colaboradores', element: <Lazy><WrenchTimeColaboradoresPage /></Lazy> },
      { path: 'rdo/wrench-time/tendencia', element: <Lazy><WrenchTimeTendenciaPage /></Lazy> },
      { path: 'rdo/wrench-time/estudo', element: <Lazy><WrenchTimeEstudoPage /></Lazy> },
      { path: 'rdo/wrench-time/dia/:dtref', element: <Lazy><WrenchTimeDiaPage /></Lazy> },
      { path: 'rdo/wrench-time/dia/:dtref/colab/:codparc', element: <Lazy><WrenchTimeDiaColabPage /></Lazy> },
      { path: 'manutencao', element: <Lazy><HubManutencaoPage /></Lazy> },
      { path: 'manutencao/ordens-de-servico', element: <Lazy><OsListPage /></Lazy> },
      { path: 'manutencao/servicos-executor', element: <Lazy><OsExecutorPage /></Lazy> },
      { path: 'manutencao/dashboard', element: <Lazy><OsDashboardPage /></Lazy> },
      { path: 'manutencao/os/:nuos', element: <Lazy><OsDetailPage /></Lazy> },
      { path: 'manutencao/veiculos', element: <Lazy><VeiculoListPage /></Lazy> },
      { path: 'manutencao/veiculo/:codveiculo', element: <Lazy><VeiculoDetailPage /></Lazy> },
      { path: 'veiculos', element: <Lazy><VeiculoListPage /></Lazy> },
      { path: 'veiculos/:codveiculo', element: <Lazy><VeiculoDetailPage /></Lazy> },
      { path: 'manutencao/executores/ranking', element: <Lazy><ExecutorRankingPage /></Lazy> },
      { path: 'manutencao/analise-tipo-veiculo', element: <Lazy><OsAnaliseTipoPage /></Lazy> },
      { path: 'manutencao/apontamentos', element: <Lazy><ApontamentosPage /></Lazy> },
      { path: 'manutencao/apontamentos/pendentes', element: <Lazy><ApontamentosPendentesPage /></Lazy> },
      { path: 'manutencao/apontamentos/com-os', element: <Lazy><ApontamentosComOsPage /></Lazy> },
      { path: 'manutencao/apontamentos/veiculo/:codveiculo', element: <Lazy><ApontamentosVeiculoPage /></Lazy> },
      { path: 'manutencao/servicos-grupo', element: <Lazy><ServicosGrupoPage /></Lazy> },
      { path: 'locais', element: <Lazy><LocaisPage /></Lazy> },
      { path: 'manutencao/apontamentos/:codigo', element: <Lazy><ApontamentoDetailPage /></Lazy> },
      { path: 'armarios', element: <Lazy><ArmarioListPage /></Lazy> },
      { path: 'funcionarios', element: <Lazy><FuncionariosPage /></Lazy> },
      { path: 'funcionarios/:codparc', element: <Lazy><FuncionarioDetailPage /></Lazy> },
      { path: 'ti/chamados', element: <Lazy><ChamadosPage /></Lazy> },
      { path: 'ti/chamados/por-setor', element: <Lazy><ChamadosPorSetorPage /></Lazy> },
      { path: 'ti/chamados/:nuchamado', element: <Lazy><ChamadoDetailPage /></Lazy> },
      { path: 'veiculos/acompanhamento', element: <Lazy><VeiculosAcompanhamentoPage /></Lazy> },
      { path: 'patrimonio', element: <Lazy><PatrimonioHubPage /></Lazy> },
      { path: 'patrimonio/bem/:codbem', element: <Lazy><PatrimonioBemDetailPage /></Lazy> },
      { path: 'patrimonio/mobilizacao', element: <Lazy><PatrimonioMobilizacaoPage /></Lazy> },
      { path: 'patrimonio/depreciacao', element: <Lazy><PatrimonioDepreciacaoPage /></Lazy> },
      { path: 'patrimonio/categorias', element: <Lazy><PatrimonioCategoriasPage /></Lazy> },
      { path: 'em-tempo-real', element: <Lazy><EmTempoRealPage /></Lazy> },
      { path: 'em-tempo-real/:nunota', element: <Lazy><EmTempoRealDetailPage /></Lazy> },
      { path: 'poc-charts', element: <Lazy><PocChartsPage /></Lazy> },
      { path: 'teste/fonts', element: <Lazy><TesteFontsPage /></Lazy> },
      { path: 'sitemap', element: <Lazy><SitemapPage /></Lazy> },
      { path: 'me', element: <Lazy><ProfilePage /></Lazy> },
    ],
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppShellFull />
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorBoundary />,
    children: [
      { path: 'database', element: <Lazy><DatabasePage /></Lazy> },
      { path: 'permissoes', element: <Lazy><PermissoesPage /></Lazy> },
      { path: 'seguranca/password-generator', element: <Lazy><PasswordGeneratorPage /></Lazy> },
    ],
  },
  {
    path: '/p/func/:codemp/:codfunc',
    element: <Lazy><FuncionarioPublicCardPage /></Lazy>,
  },
  {
    path: '/p/armario/:codarmario',
    element: <Lazy><ArmarioPublicPage /></Lazy>,
  },
  {
    path: '/p/motivo/:id',
    element: <Lazy><MotivoPublicPage /></Lazy>,
  },
  { path: '*', element: <Lazy><NotFoundPage /></Lazy> },
]);
