import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { ExecutorRankingService } from '../../../domain/services/executor-ranking.service';

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

const querySchema = z.object({
  startDate: z.string().regex(dateRegex, 'Date must be in YYYY-MM-DD format').optional(),
  endDate: z.string().regex(dateRegex, 'Date must be in YYYY-MM-DD format').optional(),
});

export async function executorRankingRoutes(app: FastifyInstance) {
  const service = new ExecutorRankingService();

  app.get('/os/executors/ranking', async (request, reply) => {
    const parsed = querySchema.safeParse(request.query);

    if (!parsed.success) {
      return reply.status(400).send({
        error: 'Invalid query parameters',
        details: parsed.error.flatten(),
      });
    }

    return service.getRanking(parsed.data);
  });
}
