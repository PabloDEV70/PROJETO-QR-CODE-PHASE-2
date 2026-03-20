import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { AnexosService } from '../../../domain/services/anexos.service';

const anexosParamsSchema = z.object({
  modulo: z.string().min(1),
  pk: z.string().min(1),
});

export async function anexosRoutes(app: FastifyInstance) {
  const anexosService = new AnexosService();

  app.get('/anexos/:modulo/:pk', async (request) => {
    const { modulo, pk } = anexosParamsSchema.parse(request.params);
    return anexosService.getAnexos(modulo, pk);
  });

  app.get('/anexos/modulos', async () => {
    return anexosService.getModulosDisponiveis();
  });
}
