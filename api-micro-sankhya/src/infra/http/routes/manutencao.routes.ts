import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { OsManutencaoService } from '../../../domain/services/os-manutencao.service';
import { ManutencaoAlertasService } from '../../../domain/services/manutencao-alertas.service';
import { ManutencaoHistoricoService } from '../../../domain/services/manutencao-historico.service';
import { QueryExecutor } from '../../../infra/api-mother/queryExecutor';
import { NotFoundError } from '../../../domain/errors';

const listSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
  status: z.string().optional(),
  manutencao: z.string().optional(),
  adStatusGig: z.string().optional(),
  codveiculo: z.coerce.number().optional(),
  codparc: z.coerce.number().optional(),
  dataInicio: z.string().optional(),
  dataFim: z.string().optional(),
  orderBy: z.string().optional(),
  orderDir: z.enum(['ASC', 'DESC']).optional(),
});

const searchSchema = z.object({ q: z.string().min(1) });
const nuosSchema = z.object({ nuos: z.coerce.number() });
const codveiculoSchema = z.object({ codveiculo: z.coerce.number() });
const codparcSchema = z.object({ codparc: z.coerce.number() });
const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
});
const limitSchema = z.object({ limit: z.coerce.number().min(1).max(200).default(50) });

/**
 * Rotas de Manutenção (/man/) - Dashboard, OS e Histórico
 */
export async function manutencaoRoutes(app: FastifyInstance) {
  const osService = new OsManutencaoService();
  const alertasService = new ManutencaoAlertasService();
  const historicoService = new ManutencaoHistoricoService();

  // === Lookups (dropdowns) ===
  const qe = new QueryExecutor();

  app.get('/man/empresas', async () => {
    return qe.executeQuery<{ CODEMP: number; nome: string }>(
      `SELECT CODEMP, RTRIM(NOMEFANTASIA) AS nome FROM TSIEMP ORDER BY CODEMP`,
    );
  });

  // === KPIs e Dashboard ===
  app.get('/man/kpis', async () => alertasService.getKpis());
  app.get('/man/stats', async () => osService.getStats());
  app.get('/man/dashboard', async () => osService.getDashboard());

  // === Alertas e Análises ===
  app.get('/man/alertas', async () => alertasService.getAlertas());
  app.get('/man/ativas', async (request) => {
    const { limit } = limitSchema.parse(request.query);
    return alertasService.getAtivasDetalhadas(limit);
  });
  app.get('/man/veiculos-multiplas-os', async () => alertasService.getVeiculosMultiplasOs());
  app.get('/man/media-dias', async () => alertasService.getMediaDiasPorTipo());
  app.get('/man/tempo-servicos', async (request) => {
    const { dataInicio, dataFim, codexec, codGrupoProd } = z.object({
      dataInicio: z.string().optional(),
      dataFim: z.string().optional(),
      codexec: z.coerce.number().optional(),
      codGrupoProd: z.coerce.number().optional(),
    }).parse(request.query);
    return alertasService.getTempoServicos({ dataInicio, dataFim, codexec, codGrupoProd });
  });

  app.get('/man/servicos-com-execucao', async () => alertasService.getServicosComExecucao());

  app.get('/man/grupos-arvore', async () => alertasService.getGruposArvore());

  app.get('/man/servicos-por-grupo', async (request) => {
    const { codGrupo } = z.object({
      codGrupo: z.coerce.number(),
    }).parse(request.query);
    return alertasService.getServicosPorGrupo(codGrupo);
  });

  app.get('/man/performance-servico-executor', async (request) => {
    const { codprod, dataInicio, dataFim, codveiculo } = z.object({
      codprod: z.coerce.number(),
      dataInicio: z.string().optional(),
      dataFim: z.string().optional(),
      codveiculo: z.coerce.number().optional(),
    }).parse(request.query);
    return alertasService.getPerformanceServicoExecutor({ codprod, dataInicio, dataFim, codveiculo });
  });

  app.get('/man/performance-servico-execucoes', async (request) => {
    const { codprod, dataInicio, dataFim, codveiculo } = z.object({
      codprod: z.coerce.number(),
      dataInicio: z.string().optional(),
      dataFim: z.string().optional(),
      codveiculo: z.coerce.number().optional(),
    }).parse(request.query);
    return alertasService.getPerformanceServicoExecucoes({ codprod, dataInicio, dataFim, codveiculo });
  });

  // === Listagem e Busca ===
  app.get('/man/os/search', async (request) => {
    const { q } = searchSchema.parse(request.query);
    return osService.search(q);
  });
  app.get('/man/os', async (request) => {
    const options = listSchema.parse(request.query);
    return osService.list(options);
  });

  // === Detalhes de OS ===
  app.get('/man/os/:nuos', async (request) => {
    const { nuos } = nuosSchema.parse(request.params);
    const os = await osService.getById(nuos);
    if (!os) throw new NotFoundError('OS nao encontrada');
    return os;
  });
  app.get('/man/os/:nuos/servicos', async (request) => {
    const { nuos } = nuosSchema.parse(request.params);
    return osService.getServicos(nuos);
  });
  app.get('/man/os/:nuos/historico', async (request) => {
    const { nuos } = nuosSchema.parse(request.params);
    return historicoService.getHistoricoOs(nuos);
  });

  // === Por Veículo/Parceiro ===
  app.get('/man/veiculo/:codveiculo', async (request) => {
    const { codveiculo } = codveiculoSchema.parse(request.params);
    const { page, limit } = paginationSchema.parse(request.query);
    return osService.getByVeiculo(codveiculo, page, limit);
  });
  app.get('/man/parceiro/:codparc', async (request) => {
    const { codparc } = codparcSchema.parse(request.params);
    const { page, limit } = paginationSchema.parse(request.query);
    return osService.getByParceiro(codparc, page, limit);
  });

  // === Histórico de Veículo ===
  app.get('/man/veiculo/:codveiculo/resumo', async (request) => {
    const { codveiculo } = codveiculoSchema.parse(request.params);
    const resumo = await historicoService.getHistoricoResumo(codveiculo);
    if (!resumo) throw new NotFoundError('Veiculo nao encontrado');
    return resumo;
  });
  app.get('/man/veiculo/:codveiculo/historico', async (request) => {
    const { codveiculo } = codveiculoSchema.parse(request.params);
    const { page, limit } = paginationSchema.parse(request.query);
    return historicoService.getHistoricoOsList(codveiculo, { page, limit });
  });
  app.get('/man/veiculo/:codveiculo/servicos-frequentes', async (request) => {
    const { codveiculo } = codveiculoSchema.parse(request.params);
    return historicoService.getServicosMaisExecutados(codveiculo);
  });
  app.get('/man/veiculo/:codveiculo/observacoes', async (request) => {
    const { codveiculo } = codveiculoSchema.parse(request.params);
    const { page, limit } = paginationSchema.parse(request.query);
    return historicoService.getObservacoes(codveiculo, { page, limit });
  });
}
