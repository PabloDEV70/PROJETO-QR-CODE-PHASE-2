import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { OsDetailService } from '../../../domain/services/os-detail.service';

const paramsSchema = z.object({
  nuos: z.string().transform(Number),
});

export async function osDetailRoutes(app: FastifyInstance) {
  const service = new OsDetailService();

  app.get('/os/:nuos/observacao', async (request, reply) => {
    const parsed = paramsSchema.safeParse(request.params);

    if (!parsed.success) {
      return reply.status(400).send({
        error: 'Invalid path parameter',
        details: parsed.error.flatten(),
      });
    }

    const result = await service.getObservacao(parsed.data.nuos);

    return { observacao: result };
  });

  app.get('/os/:nuos/servicos', async (request, reply) => {
    const parsed = paramsSchema.safeParse(request.params);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid path parameter', details: parsed.error.flatten() });
    }
    return service.getServicos(parsed.data.nuos);
  });

  app.get('/os/:nuos', async (request, reply) => {
    const parsed = paramsSchema.safeParse(request.params);

    if (!parsed.success) {
      return reply.status(400).send({
        error: 'Invalid path parameter',
        details: parsed.error.flatten(),
      });
    }

    const result = await service.getEnriched(parsed.data.nuos);

    if (!result) {
      return reply.status(404).send({
        error: 'OS nao encontrada',
      });
    }

    return result;
  });
}
