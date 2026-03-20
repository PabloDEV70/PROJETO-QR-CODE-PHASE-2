import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { OsManutencaoService } from '../../../domain/services/os-manutencao.service';
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

const searchSchema = z.object({
  q: z.string().min(1),
});

const nuosSchema = z.object({
  nuos: z.coerce.number(),
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

export async function osManutencaoRoutes(app: FastifyInstance) {
  const service = new OsManutencaoService();

  app.get('/os-manutencao/stats', async (request, reply) => {
    return service.getStats();
  });

  app.get('/os-manutencao/dashboard', async (request, reply) => {
    return service.getDashboard();
  });

  app.get('/os-manutencao/search', async (request, reply) => {
    const { q } = searchSchema.parse(request.query);
    return service.search(q);
  });

  app.get('/os-manutencao', async (request, reply) => {
    const options = listSchema.parse(request.query);
    return service.list(options);
  });

  app.get('/os-manutencao/:nuos', async (request) => {
    const { nuos } = nuosSchema.parse(request.params);
    const os = await service.getById(nuos);
    if (!os) throw new NotFoundError('OS not found');
    return os;
  });

  app.get('/os-manutencao/:nuos/servicos', async (request, reply) => {
    const { nuos } = nuosSchema.parse(request.params);
    return service.getServicos(nuos);
  });

  app.get('/os-manutencao/veiculo/:codveiculo', async (request, reply) => {
    const { codveiculo } = codveiculoSchema.parse(request.params);
    const { page, limit } = paginationSchema.parse(request.query);
    return service.getByVeiculo(codveiculo, page, limit);
  });

  app.get('/os-manutencao/parceiro/:codparc', async (request, reply) => {
    const { codparc } = codparcSchema.parse(request.params);
    const { page, limit } = paginationSchema.parse(request.query);
    return service.getByParceiro(codparc, page, limit);
  });
}
