import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { OsDetalhadaService } from '../../../domain/services/os-detalhada.service';
import { NotFoundError } from '../../../domain/errors';

const nuosSchema = z.object({
  nuos: z.coerce.number(),
});

export async function osDetalhadaRoutes(app: FastifyInstance) {
  const service = new OsDetalhadaService();

  app.get('/os-detalhada/:nuos', async (request) => {
    const { nuos } = nuosSchema.parse(request.params);
    const result = await service.getDetalhada(nuos);
    if (!result) throw new NotFoundError('OS nao encontrada');
    return result;
  });
}
