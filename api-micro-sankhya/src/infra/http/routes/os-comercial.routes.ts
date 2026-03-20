import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { OsComercialService } from '../../../domain/services/os-comercial.service';
import { NotFoundError } from '../../../domain/errors';

const listSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
  situacao: z.string().optional(),
  dataInicio: z.string().optional(),
  dataFim: z.string().optional(),
  codparc: z.coerce.number().optional(),
  exibeDash: z.enum(['S', 'N']).optional(),
  orderBy: z.string().optional(),
  orderDir: z.enum(['ASC', 'DESC']).optional(),
});

const searchSchema = z.object({
  q: z.string().min(1),
});

const numosSchema = z.object({
  numos: z.coerce.number(),
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

export async function osComercialRoutes(app: FastifyInstance) {
  const service = new OsComercialService();

  // Static routes first (most specific to least specific)
  app.get('/os-comercial/stats', async (request, reply) => {
    return service.getStats();
  });

  app.get('/os-comercial/search', async (request, reply) => {
    const { q } = searchSchema.parse(request.query);
    return service.search(q);
  });

  app.get('/os-comercial/veiculo/:codveiculo', async (request, reply) => {
    const { codveiculo } = codveiculoSchema.parse(request.params);
    const { page, limit } = paginationSchema.parse(request.query);
    return service.getByVeiculo(codveiculo, page, limit);
  });

  app.get('/os-comercial/parceiro/:codparc', async (request, reply) => {
    const { codparc } = codparcSchema.parse(request.params);
    const { page, limit } = paginationSchema.parse(request.query);
    return service.getByParceiro(codparc, page, limit);
  });

  // List route (no params)
  app.get('/os-comercial', async (request, reply) => {
    const options = listSchema.parse(request.query);
    return service.list(options);
  });

  // Parametric routes last (catch-all)
  app.get('/os-comercial/:numos/itens', async (request, reply) => {
    const { numos } = numosSchema.parse(request.params);
    return service.getItens(numos);
  });

  app.get('/os-comercial/:numos', async (request) => {
    const { numos } = numosSchema.parse(request.params);
    const os = await service.getById(numos);
    if (!os) throw new NotFoundError('OS not found');
    return os;
  });
}
