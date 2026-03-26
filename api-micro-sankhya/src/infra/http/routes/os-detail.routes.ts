import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { OsDetailService } from '../../../domain/services/os-detail.service';
import { QueryExecutor } from '../../../infra/api-mother/queryExecutor';
import { osComprasVinculadas, osComprasItens } from '../../../sql-queries/TCFOSCAB/os-compras-vinculadas';
import { osTimeline } from '../../../sql-queries/TCFOSCAB/os-timeline';

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

  app.get('/os/:nuos/timeline', async (request, reply) => {
    const parsed = paramsSchema.safeParse(request.params);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid path parameter', details: parsed.error.flatten() });
    }
    const qe = new QueryExecutor();
    return qe.executeQuery(osTimeline.replace(/@nuos/g, String(parsed.data.nuos)));
  });

  app.get('/os/:nuos/compras', async (request, reply) => {
    const parsed = paramsSchema.safeParse(request.params);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid path parameter', details: parsed.error.flatten() });
    }
    const qe = new QueryExecutor();
    const nu = String(parsed.data.nuos);
    const [notas, itens] = await Promise.all([
      qe.executeQuery(osComprasVinculadas.replace(/@nuos/g, nu)),
      qe.executeQuery(osComprasItens.replace(/@nuos/g, nu)),
    ]);
    return { notas, itens };
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
