import { FastifyInstance, FastifyRequest } from 'fastify';
import { VeiculoManutencaoServiceImpl } from '../../../domain/services/veiculo-manutencao.service';
import { NotFoundError, ValidationError } from '../../../domain/errors';

interface VeiculoParams {
  id: string;
}

function parseVeiculoId(id: string): number {
  const codveiculo = parseInt(id, 10);
  if (isNaN(codveiculo)) throw new ValidationError('Invalid vehicle ID');
  return codveiculo;
}

export async function veiculoManutencaoDetailRoutes(
  app: FastifyInstance,
  service: VeiculoManutencaoServiceImpl,
): Promise<void> {
  app.get(
    '/veiculos/:id/dashboard',
    async (request: FastifyRequest<{ Params: VeiculoParams }>) => {
      const codveiculo = parseVeiculoId(request.params.id);
      const dashboard = await service.getDashboard(codveiculo);
      if (!dashboard) throw new NotFoundError('Vehicle not found');
      return dashboard;
    },
  );

  app.get(
    '/veiculos/:id/proxima-manutencao',
    async (request: FastifyRequest<{ Params: VeiculoParams }>) => {
      const codveiculo = parseVeiculoId(request.params.id);
      const proxima = await service.getProximaManutencao(codveiculo);
      if (!proxima) {
        throw new NotFoundError('No maintenance plan found for this vehicle');
      }
      return proxima;
    },
  );

  app.get(
    '/veiculos/:id/aderencia-plano',
    async (request: FastifyRequest<{ Params: VeiculoParams }>) => {
      const codveiculo = parseVeiculoId(request.params.id);
      const aderencia = await service.getAderenciaPlano(codveiculo);
      if (!aderencia) {
        throw new NotFoundError('No maintenance data found for this vehicle');
      }
      return aderencia;
    },
  );
}
