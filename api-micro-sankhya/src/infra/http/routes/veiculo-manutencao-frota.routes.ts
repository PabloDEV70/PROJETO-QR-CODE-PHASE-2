import { FastifyInstance, FastifyRequest } from 'fastify';
import { VeiculoManutencaoServiceImpl } from '../../../domain/services/veiculo-manutencao.service';

interface FrotaQuerystring {
  status?: string;
  page?: string;
  limit?: string;
}

interface ListQuerystring {
  page?: string;
  limit?: string;
}

export async function veiculoManutencaoFrotaRoutes(
  app: FastifyInstance,
  service: VeiculoManutencaoServiceImpl,
): Promise<void> {
  app.get(
    '/man/frota/status',
    async (request: FastifyRequest<{ Querystring: FrotaQuerystring }>) => {
      const { status, page, limit } = request.query;
      return service.getFrotaStatus({
        status,
        page: page ? parseInt(page, 10) : undefined,
        limit: limit ? parseInt(limit, 10) : undefined,
      });
    },
  );

  app.get(
    '/man/frota/manutencoes-urgentes',
    async (request: FastifyRequest<{ Querystring: ListQuerystring }>) => {
      const { page, limit } = request.query;
      return service.getManutencoesUrgentes(
        page ? parseInt(page, 10) : undefined,
        limit ? parseInt(limit, 10) : undefined,
      );
    },
  );
}
