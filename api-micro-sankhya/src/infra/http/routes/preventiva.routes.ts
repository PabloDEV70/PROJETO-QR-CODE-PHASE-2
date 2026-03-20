import { FastifyInstance, FastifyRequest } from 'fastify';
import { getPreventivaService } from '../../../domain/services/preventiva.service';
import { NotFoundError, ValidationError } from '../../../domain/errors';

interface VeiculoParams {
  id: string;
}

function parseVeiculoId(id: string): number {
  const codveiculo = parseInt(id, 10);
  if (isNaN(codveiculo) || codveiculo <= 0) {
    throw new ValidationError('Invalid vehicle ID');
  }
  return codveiculo;
}

export async function preventivaRoutes(app: FastifyInstance): Promise<void> {
  const service = getPreventivaService();

  app.get('/veiculos/preventivas/quadro', async () => {
    return service.getFrotaPreventivas();
  });

  app.get(
    '/veiculos/:id/preventivas',
    async (request: FastifyRequest<{ Params: VeiculoParams }>) => {
      const codveiculo = parseVeiculoId(request.params.id);
      const result = await service.getVeiculoPreventivas(codveiculo);
      if (!result) throw new NotFoundError('Vehicle not found');
      return result;
    },
  );
}
