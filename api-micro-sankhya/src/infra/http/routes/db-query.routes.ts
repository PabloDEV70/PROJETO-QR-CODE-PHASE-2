import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { DbQueryService } from '../../../domain/services/db-query.service';
import { ValidationError } from '../../../domain/errors';
import { adminGuard } from '../plugins/admin-guard';

const querySchema = z.object({
  query: z.string().min(1, 'Query is required'),
});

export async function dbQueryRoutes(app: FastifyInstance) {
  app.addHook('onRequest', adminGuard);
  const service = new DbQueryService();

  app.post('/db/query', async (request) => {
    const parsed = querySchema.safeParse(request.body);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.issues[0]?.message ?? 'Invalid request');
    }
    try {
      return await service.executeQuery(parsed.data.query);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.startsWith('SECURITY')) {
        throw new ValidationError(msg);
      }
      throw err;
    }
  });
}
