import { FastifyPluginAsync } from 'fastify';
import { healthRoutes } from './health.routes';
import { versionRoutes } from './version.routes';
import { authRoutes } from './auth.routes';
import { motivosRoutes } from './motivos.routes';
import { parceirosRoutes } from './parceiros.routes';
import { funcionariosRoutes } from './funcionarios.routes';
import { funcionarioHoraExtraRoutes } from './funcionario-hora-extra.routes';
import { veiculosRoutes } from './veiculos.routes';
import { hstveiRoutes } from './hstvei.routes';
import { contratosRoutes } from './contratos.routes';
import { osManutencaoRoutes } from './os-manutencao.routes';
import { osMutationRoutes } from './os-mutation.routes';
import { osServicoExecRoutes } from './os-servico-exec.routes';
import { manutencaoRoutes } from './manutencao.routes';
import { manutencaoPlanosRoutes } from './manutencao-planos.routes';
import { rdoRoutes } from './rdo.routes';
import { rdoMutationRoutes } from './rdo-mutation.routes';
import { rdoAnalyticsRoutes } from './rdo-analytics.routes';
import { colaboradorTimelineRoutes } from './colaborador-timeline.routes';
import { osComercialRoutes } from './os-comercial.routes';
import { dashboardRoutes } from './dashboard.routes';
import { usuariosRoutes } from './usuarios.routes';
import { rhRoutes } from './rh.routes';
import { rdoManagerRoutes } from './rdo-manager.routes';
import { veiculoManutencaoRoutes } from './veiculo-manutencao.routes';
import { preventivaRoutes } from './preventiva.routes';
import { horasEsperadasRoutes } from './horas-esperadas.routes';
import { permissoesRoutes } from './permissoes.routes';
import { osListRoutes } from './os-list.routes';
import { osDashboardRoutes } from './os-dashboard.routes';
import { osDetailRoutes } from './os-detail.routes';
import { vehicleDetailRoutes } from './vehicle-detail.routes';
import { executorRankingRoutes } from './executor-ranking.routes';
import { osAnaliseTipoRoutes } from './os-analise-tipo.routes';
import { apontamentosRoutes } from './apontamentos.routes';
import { apontamentoMutationRoutes } from './apontamento-mutation.routes';
import { servicosGrupoRoutes } from './servicos-grupo.routes';
import { servicosGrupoMutationRoutes } from './servicos-grupo-mutation.routes';
import { locaisRoutes } from './locais.routes';
import { chamadosRoutes } from './chamados.routes';
import { anexosRoutes } from './anexos.routes';
import { armariosRoutes } from './armarios.routes';
import { osDetalhadaRoutes } from './os-detalhada.routes';
import { calendarioComercialRoutes } from './calendario-comercial.routes';
import { emTempoRealRoutes } from './em-tempo-real.routes';
import { notaDetalheRoutes } from './nota-detalhe.routes';
import { patrimonioRoutes } from './patrimonio.routes';
import { presenceRoutes } from './presence.routes';
import { cabDetalhamentoRoutes } from './cab-detalhamento.routes';
import { produtoRoutes } from './produto.routes';
import { dbQueryRoutes } from './db-query.routes';
import { dbMonitorRoutes } from './db-monitor.routes';
import { dbTablesRoutes } from './db-tables.routes';
import { dbObjectsRoutes } from './db-objects.routes';
import { dbDictionaryRoutes } from './db-dictionary.routes';
import { dbAuditRoutes } from './db-audit.routes';
import { painelSaidasRoutes } from './painel-saidas.routes';
import { analiseFrotaRoutes } from './analise-frota.routes';
import { comprasRoutes } from './compras.routes';
import { seriesRoutes } from './series.routes';
import { usersOnlineRoutes } from './users-online.routes';
import { corridasRoutes } from './corridas.routes';

export const routePlugins: FastifyPluginAsync[] = [
  versionRoutes,
  healthRoutes,
  authRoutes,
  motivosRoutes,
  parceirosRoutes,
  funcionariosRoutes,
  funcionarioHoraExtraRoutes,
  veiculosRoutes,
  hstveiRoutes,
  contratosRoutes,
  osManutencaoRoutes,
  osMutationRoutes,
  osServicoExecRoutes,
  manutencaoRoutes,
  manutencaoPlanosRoutes,
  rdoRoutes,
  rdoMutationRoutes,
  rdoAnalyticsRoutes,
  colaboradorTimelineRoutes,
  osComercialRoutes,
  dashboardRoutes,
  usuariosRoutes,
  rhRoutes,
  rdoManagerRoutes,
  veiculoManutencaoRoutes,
  preventivaRoutes,
  horasEsperadasRoutes,
  permissoesRoutes,
  osListRoutes,
  osDashboardRoutes,
  osDetailRoutes,
  vehicleDetailRoutes,
  executorRankingRoutes,
  osAnaliseTipoRoutes,
  apontamentosRoutes,
  apontamentoMutationRoutes,
  servicosGrupoRoutes,
  servicosGrupoMutationRoutes,
  locaisRoutes,
  chamadosRoutes,
  anexosRoutes,
  armariosRoutes,
  osDetalhadaRoutes,
  calendarioComercialRoutes,
  emTempoRealRoutes,
  notaDetalheRoutes,
  patrimonioRoutes,
  presenceRoutes,
  cabDetalhamentoRoutes,
  produtoRoutes,
  dbQueryRoutes,
  dbMonitorRoutes,
  dbTablesRoutes,
  dbObjectsRoutes,
  dbDictionaryRoutes,
  dbAuditRoutes,
  painelSaidasRoutes,
  analiseFrotaRoutes,
  comprasRoutes,
  seriesRoutes,
  usersOnlineRoutes,
  corridasRoutes,
];
