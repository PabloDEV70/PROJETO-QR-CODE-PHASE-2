import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { RdoService } from '../../../domain/services/rdo.service';
import { RdoDetalhesService } from '../../../domain/services/rdo-detalhes.service';
import { NotFoundError } from '../../../domain/errors';

const listSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(200).default(50),
  codparc: z.string().optional(),
  dataInicio: z.string().optional(),
  dataFim: z.string().optional(),
  comOs: z.coerce.boolean().optional(),
  semOs: z.coerce.boolean().optional(),
  coddep: z.string().optional(),
  codcargo: z.string().optional(),
  codfuncao: z.string().optional(),
  codemp: z.string().optional(),
  orderBy: z.string().optional(),
  orderDir: z.enum(['ASC', 'DESC']).optional(),
});

const searchSchema = z.object({
  q: z.string().min(1),
});

const codrdoSchema = z.object({
  codrdo: z.coerce.number(),
});

const codveiculoSchema = z.object({
  codveiculo: z.coerce.number(),
});

const codparcSchema = z.object({
  codparc: z.coerce.number(),
});

const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
});

const resumoDiarioSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
  dataInicio: z.string().optional(),
  dataFim: z.string().optional(),
});

const detalhesPeridoSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
  dataInicio: z.string().optional(),
  dataFim: z.string().optional(),
  codparc: z.string().optional(),
  rdomotivocod: z.string().optional(),
  comOs: z.coerce.boolean().optional(),
  semOs: z.coerce.boolean().optional(),
  coddep: z.string().optional(),
  codcargo: z.string().optional(),
  codfuncao: z.string().optional(),
  codemp: z.string().optional(),
  orderBy: z.string().optional(),
  orderDir: z.enum(['ASC', 'DESC']).optional(),
});

export async function rdoRoutes(app: FastifyInstance) {
  const service = new RdoService();
  const detalhesService = new RdoDetalhesService();

  app.get('/rdo/stats', async (request, reply) => {
    const q = request.query as { dataInicio?: string; dataFim?: string };
    return service.getStats(q.dataInicio, q.dataFim);
  });

  app.get('/rdo/resumo-diario', async (request, reply) => {
    const { page, limit, dataInicio, dataFim } = resumoDiarioSchema.parse(request.query);
    return service.getResumoDiario(page, limit, dataInicio, dataFim);
  });

  app.get('/rdo/search', async (request, reply) => {
    const { q } = searchSchema.parse(request.query);
    return service.search(q);
  });

  // Batch endpoint: returns full "quem faz" snapshot in 1 query
  app.get('/rdo/quem-faz', async (request) => {
    const { data } = z.object({ data: z.string() }).parse(request.query);
    return service.getQuemFazSnapshot(data);
  });

  app.get('/rdo', async (request, reply) => {
    const options = listSchema.parse(request.query);
    return service.list(options);
  });

  app.get('/rdo/detalhes', async (request, reply) => {
    const options = detalhesPeridoSchema.parse(request.query);
    return detalhesService.getDetalhesPorPeriodo(options);
  });

  app.get('/rdo/:codrdo', async (request) => {
    const { codrdo } = codrdoSchema.parse(request.params);
    const rdo = await service.getById(codrdo);
    if (!rdo) throw new NotFoundError('RDO not found');
    return rdo;
  });

  app.get('/rdo/:codrdo/metricas', async (request) => {
    const { codrdo } = codrdoSchema.parse(request.params);
    const rdo = await service.getByIdEnriched(codrdo);
    if (!rdo) throw new NotFoundError('RDO not found');
    return rdo;
  });

  app.get('/rdo/:codrdo/detalhes', async (request, reply) => {
    const { codrdo } = codrdoSchema.parse(request.params);
    return service.getDetalhes(codrdo);
  });

  app.get('/rdo/parceiro/:codparc', async (request, reply) => {
    const { codparc } = codparcSchema.parse(request.params);
    const { page, limit } = paginationSchema.parse(request.query);
    return service.getByParceiro(codparc, page, limit);
  });

  app.get('/rdo/veiculo/:codveiculo', async (request, reply) => {
    const { codveiculo } = codveiculoSchema.parse(request.params);
    const { page, limit } = paginationSchema.parse(request.query);
    return service.getByVeiculo(codveiculo, page, limit);
  });
}
