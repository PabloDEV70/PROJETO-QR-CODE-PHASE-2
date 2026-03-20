import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { NotaDetalheService } from '../../../domain/services/nota-detalhe.service';

const paramsSchema = z.object({
  nunota: z.string().transform(Number),
});

export async function notaDetalheRoutes(app: FastifyInstance) {
  const service = new NotaDetalheService();

  app.get('/em-tempo-real/:nunota', async (request, reply) => {
    const parsed = paramsSchema.safeParse(request.params);

    if (!parsed.success) {
      return reply.status(400).send({
        error: 'Parametro invalido',
        details: parsed.error.flatten(),
      });
    }

    const result = await service.getDetalhe(parsed.data.nunota);

    if (!result) {
      return reply.status(404).send({
        error: 'Nota nao encontrada',
      });
    }

    return result;
  });
}
