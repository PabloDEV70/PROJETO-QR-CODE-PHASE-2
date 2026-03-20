import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { MotivosService } from '../../../domain/services/motivos.service';
import { MotivoConfigService } from '../../../domain/services/motivo-config.service';
import { NotFoundError } from '../../../domain/errors';

const listSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(500).default(50),
  ativo: z.enum(['S', 'N']).optional(),
  dataInicio: z.string().optional(),
  dataFim: z.string().optional(),
  orderBy: z.string().optional(),
  orderDir: z.enum(['ASC', 'DESC']).optional(),
});

const searchSchema = z.object({
  q: z.string().min(1),
  dataInicio: z.string().optional(),
  dataFim: z.string().optional(),
});

const idSchema = z.object({
  id: z.coerce.number(),
});

export async function motivosRoutes(app: FastifyInstance) {
  const motivosService = new MotivosService();
  const configService = new MotivoConfigService();

  app.get('/motivos/config', async () => {
    return configService.getConfigArray();
  });

  app.get('/motivos', async (request, reply) => {
    const options = listSchema.parse(request.query);
    return motivosService.list(options);
  });

  app.get('/motivos/search', async (request, reply) => {
    const { q, dataInicio, dataFim } = searchSchema.parse(request.query);
    return motivosService.search(q, dataInicio, dataFim);
  });

  app.get('/motivos/:id', async (request) => {
    const { id } = idSchema.parse(request.params);
    const motivo = await motivosService.getById(id);
    if (!motivo) throw new NotFoundError('Motivo not found');
    return motivo;
  });
}
