import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { VeiculosService } from '../../../domain/services/veiculos.service';
import { VeiculosDashboardService } from '../../../domain/services/veiculos-dashboard.service';
import { VeiculoMonitoramentoService } from '../../../domain/services/veiculo-monitoramento.service';
import { VALID_INCLUDES, PerfilVeiculoInclude } from '../../../types/TGFVEI/perfil-include';
import { VeiculoStatus } from '../../../types/TGFVEI/tgf-vei-monitoramento';
import { NotFoundError } from '../../../domain/errors';

const listSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
  ativo: z.string().optional(),
  categoria: z.string().optional(),
  searchTerm: z.string().optional(),
  orderBy: z.string().optional(),
  orderDir: z.enum(['ASC', 'DESC']).optional(),
});

const searchSchema = z.object({
  q: z.string().min(1),
});

const idSchema = z.object({
  codveiculo: z.coerce.number(),
});

const perfilQuerySchema = z.object({
  include: z.string().optional(),
});

const utilizacaoQuerySchema = z.object({
  dataInicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  dataFim: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

const VALID_STATUS: VeiculoStatus[] = [
  'LIVRE',
  'EM_USO',
  'MANUTENCAO',
  'AGUARDANDO_MANUTENCAO',
  'BLOQUEIO_COMERCIAL',
  'PARADO',
  'ALUGADO_CONTRATO',
  'RESERVADO_CONTRATO',
  'AGENDADO',
];

const monitoramentoSchema = z.object({
  status: z.string().optional(),
  comAlerta: z.coerce.boolean().optional(),
  categoria: z.string().optional(),
});

function parseIncludes(raw?: string): PerfilVeiculoInclude[] {
  if (!raw) return [];
  return raw
    .split(',')
    .map(s => s.trim())
    .filter((s): s is PerfilVeiculoInclude =>
      VALID_INCLUDES.includes(s as PerfilVeiculoInclude),
    );
}

export async function veiculosRoutes(app: FastifyInstance) {
  const service = new VeiculosService();
  const dashService = new VeiculosDashboardService();
  const monitorService = new VeiculoMonitoramentoService();

  app.get('/veiculos', async (request) => {
    const options = listSchema.parse(request.query);
    return service.list(options);
  });

  app.get('/veiculos/dashboard', async () => {
    return dashService.getDashboard();
  });

  app.get('/veiculos/stats', async () => {
    return dashService.getStats();
  });

  app.get('/veiculos/stats/manutencao', async () => {
    return dashService.getStatsManutencao();
  });

  app.get('/veiculos/resumo-manutencoes', async () => {
    return dashService.getResumoManutencoes();
  });

  app.get('/veiculos/alertas', async () => {
    return dashService.getAlertas();
  });

  app.get('/veiculos/auditoria', async () => {
    return dashService.getAuditoria();
  });

  app.get('/veiculos/monitoramento', async (request) => {
    const query = monitoramentoSchema.parse(request.query);
    const filters = {
      status: query.status && VALID_STATUS.includes(query.status as VeiculoStatus)
        ? (query.status as VeiculoStatus)
        : undefined,
      comAlerta: query.comAlerta,
      categoria: query.categoria,
    };
    return monitorService.getMonitoramento(filters);
  });

  app.get('/veiculos/monitoramento/stats', async () => {
    return monitorService.getStats();
  });

  app.get('/veiculos/agendamentos-futuros', async () => {
    return service.getAgendamentosFuturos();
  });

  app.get('/veiculos/search', async (request) => {
    const { q } = searchSchema.parse(request.query);
    return service.search(q);
  });

  app.get('/veiculos/:codveiculo', async (request) => {
    const { codveiculo } = idSchema.parse(request.params);
    const veiculo = await service.getById(codveiculo);
    if (!veiculo) throw new NotFoundError('Veiculo nao encontrado');
    return veiculo;
  });

  app.get('/veiculos/:codveiculo/perfil', async (request) => {
    const { codveiculo } = idSchema.parse(request.params);
    const { include } = perfilQuerySchema.parse(request.query);
    const includes = parseIncludes(include);
    const perfil = await service.getPerfilCompleto(codveiculo, includes);
    if (!perfil) throw new NotFoundError('Veiculo nao encontrado');
    return perfil;
  });

  app.get('/veiculos/:codveiculo/os-comerciais', async (request) => {
    const { codveiculo } = idSchema.parse(request.params);
    return service.getOsComerciais(codveiculo);
  });

  app.get('/veiculos/:codveiculo/os-manutencao', async (request) => {
    const { codveiculo } = idSchema.parse(request.params);
    return service.getOsManutencao(codveiculo);
  });

  app.get('/veiculos/:codveiculo/contratos', async (request) => {
    const { codveiculo } = idSchema.parse(request.params);
    return service.getContratos(codveiculo);
  });

  app.get('/veiculos/:codveiculo/os-manutencao-ativas', async (request) => {
    const { codveiculo } = idSchema.parse(request.params);
    return service.getOsManutencaoAtivasEnriched(codveiculo);
  });

  app.get('/veiculos/:codveiculo/historico-unificado', async (request) => {
    const { codveiculo } = idSchema.parse(request.params);
    return service.getHistoricoUnificado(codveiculo);
  });

  app.get('/veiculos/:codveiculo/abastecimentos', async (request) => {
    const { codveiculo } = idSchema.parse(request.params);
    return service.getAbastecimentos(codveiculo);
  });

  app.get('/veiculos/:codveiculo/historico-km', async (request) => {
    const { codveiculo } = idSchema.parse(request.params);
    return service.getHistoricoKm(codveiculo);
  });

  app.get('/veiculos/:codveiculo/documentos', async (request) => {
    const { codveiculo } = idSchema.parse(request.params);
    return service.getDocumentos(codveiculo);
  });

  app.get('/veiculos/:codveiculo/consumo', async (request) => {
    const { codveiculo } = idSchema.parse(request.params);
    return service.getConsumo(codveiculo);
  });

  app.get('/veiculos/:codveiculo/planos-preventivos', async (request) => {
    const { codveiculo } = idSchema.parse(request.params);
    return service.getPlanos(codveiculo);
  });

  app.get('/veiculos/:codveiculo/historico-completo', async (request) => {
    const { codveiculo } = idSchema.parse(request.params);
    return service.getHistoricoCompleto(codveiculo);
  });

  app.get('/veiculos/:codveiculo/utilizacao', async (request) => {
    const { codveiculo } = idSchema.parse(request.params);
    const query = utilizacaoQuerySchema.parse(request.query);
    return service.getUtilizacao(codveiculo, query.dataInicio, query.dataFim);
  });
}
