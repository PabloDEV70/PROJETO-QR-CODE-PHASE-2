import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { ContratosService } from '../../../domain/services/contratos.service';
import { NotFoundError } from '../../../domain/errors';

const listSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
  status: z.enum(['vigente', 'futuro', 'encerrado']).optional(),
  codparc: z.coerce.number().optional(),
  orderBy: z.string().optional(),
  orderDir: z.enum(['ASC', 'DESC']).optional(),
});

const searchSchema = z.object({
  q: z.string().min(1),
});

const idSchema = z.object({
  id: z.coerce.number(),
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

export async function contratosRoutes(app: FastifyInstance) {
  const contratosService = new ContratosService();

  app.get('/contratos', async (request, reply) => {
    const options = listSchema.parse(request.query);
    return contratosService.list(options);
  });

  app.get('/contratos/search', async (request, reply) => {
    const { q } = searchSchema.parse(request.query);
    return contratosService.search(q);
  });

  app.get('/contratos/vigentes', async (request, reply) => {
    const { page, limit } = paginationSchema.parse(request.query);
    return contratosService.getVigentes(page, limit);
  });

  app.get('/contratos/:id', async (request) => {
    const { id } = idSchema.parse(request.params);
    const contrato = await contratosService.getById(id);
    if (!contrato) throw new NotFoundError('Contrato not found');
    return contrato;
  });

  app.get('/contratos/veiculo/:codveiculo', async (request, reply) => {
    const { codveiculo } = codveiculoSchema.parse(request.params);
    const { page, limit } = paginationSchema.parse(request.query);
    return contratosService.getByVeiculo(codveiculo, page, limit);
  });

  app.get('/contratos/parceiro/:codparc', async (request, reply) => {
    const { codparc } = codparcSchema.parse(request.params);
    const { page, limit } = paginationSchema.parse(request.query);
    return contratosService.getByParceiro(codparc, page, limit);
  });
}
