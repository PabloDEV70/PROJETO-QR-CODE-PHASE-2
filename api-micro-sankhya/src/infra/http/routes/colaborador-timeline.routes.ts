import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { ColaboradorTimelineService } from '../../../domain/services/colaborador-timeline.service';

const timelineParamsSchema = z.object({
  codparc: z.coerce.number().int().positive(),
});

const timelineQuerySchema = z.object({
  dataInicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato: YYYY-MM-DD'),
  dataFim: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato: YYYY-MM-DD'),
});

export async function colaboradorTimelineRoutes(app: FastifyInstance) {
  const service = new ColaboradorTimelineService();

  /**
   * GET /rdo/colaborador/:codparc/timeline
   *
   * Retorna a timeline de atividades de um colaborador com cálculo de metas.
   *
   * Regras de meta:
   * - Almoço (RDOMOTIVOCOD=3): desconsiderar 60min da meta
   * - Banheiro (RDOMOTIVOCOD=2): desconsiderar 10min da meta (o que passar abate)
   *
   * @query dataInicio - Data inicial (YYYY-MM-DD)
   * @query dataFim - Data final (YYYY-MM-DD)
   */
  app.get('/rdo/colaborador/:codparc/timeline', async (request, reply) => {
    const params = timelineParamsSchema.parse(request.params);
    const query = timelineQuerySchema.parse(request.query);

    const result = await service.getTimeline({
      codparc: params.codparc,
      dataInicio: query.dataInicio,
      dataFim: query.dataFim,
    });

    if (!result) {
      return reply.code(404).send({
        error: 'Not Found',
        message: `Colaborador ${params.codparc} não encontrado`,
      });
    }

    return result;
  });
}
