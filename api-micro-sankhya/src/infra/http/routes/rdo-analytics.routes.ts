import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { RdoAnalyticsService } from '../../../domain/services/rdo-analytics.service';

const analyticsSchema = z.object({
  dataInicio: z.string().optional(),
  dataFim: z.string().optional(),
  codparc: z.string().optional(),
  coddep: z.string().optional(),
  codcargo: z.string().optional(),
  codfuncao: z.string().optional(),
  codemp: z.string().optional(),
  orderBy: z.string().optional(),
  orderDir: z.enum(['ASC', 'DESC']).optional(),
  limit: z.coerce.number().min(1).max(50).default(20),
});

/** Per-colaborador needs all rows (N colabs × M motivos) */
const colabAnalyticsSchema = analyticsSchema.extend({
  limit: z.coerce.number().min(1).max(500).default(500),
});

export async function rdoAnalyticsRoutes(app: FastifyInstance) {
  const service = new RdoAnalyticsService();

  app.get('/rdo/analytics/produtividade', async (request) => {
    const options = analyticsSchema.parse(request.query);
    return service.getProdutividade(options);
  });

  app.get('/rdo/analytics/eficiencia', async (request) => {
    const options = analyticsSchema.parse(request.query);
    return service.getEficiencia(options);
  });

  app.get('/rdo/analytics/motivos', async (request) => {
    const options = analyticsSchema.parse(request.query);
    return service.getMotivos(options);
  });

  app.get('/rdo/analytics/motivos/colaborador', async (request) => {
    const options = colabAnalyticsSchema.parse(request.query);
    return service.getMotivosPorColaborador(options);
  });

  app.get('/rdo/analytics/resumo', async (request) => {
    const options = analyticsSchema.parse(request.query);
    return service.getResumo(options);
  });

  app.get('/rdo/analytics/timeline/motivos', async (request) => {
    const options = analyticsSchema.parse(request.query);
    return service.getTimelineMotivos(options);
  });

  app.get('/rdo/analytics/timeline', async (request) => {
    const options = analyticsSchema.parse(request.query);
    return service.getTimeline(options);
  });

  app.get('/rdo/analytics/comparativo', async (request) => {
    const options = analyticsSchema.parse(request.query);
    return service.getComparativo(options);
  });

  app.get('/rdo/analytics/anomalias', async (request) => {
    const options = analyticsSchema.parse(request.query);
    return service.getAnomalias(options);
  });

  app.get('/rdo/analytics/ranking', async (request, reply) => {
    try {
      const options = analyticsSchema.parse(request.query);
      return await service.getRanking(options);
    } catch (err) {
      request.log.error(err, 'Error fetching ranking');
      reply.status(500).send({ error: 'Failed to fetch ranking' });
    }
  });

  app.get('/rdo/analytics/overtime-ranking', async (request, reply) => {
    try {
      const options = analyticsSchema.parse(request.query);
      return await service.getOvertimeRanking(options);
    } catch (err) {
      request.log.error(err, 'Error fetching overtime ranking');
      reply.status(500).send({ error: 'Failed to fetch overtime ranking' });
    }
  });
}
