import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { VehicleDetailService } from '../../../domain/services/vehicle-detail.service';

const paramsSchema = z.object({
  codveiculo: z.string().transform(Number),
});

export async function vehicleDetailRoutes(app: FastifyInstance) {
  const service = new VehicleDetailService();

  app.get('/os/vehicle/:codveiculo', async (request, reply) => {
    const parsed = paramsSchema.safeParse(request.params);

    if (!parsed.success) {
      return reply.status(400).send({
        error: 'Invalid path parameter',
        details: parsed.error.flatten(),
      });
    }

    const result = await service.getDetail(parsed.data.codveiculo);

    if (!result) {
      return reply.status(404).send({
        error: 'Veiculo nao encontrado',
      });
    }

    return result;
  });
}
