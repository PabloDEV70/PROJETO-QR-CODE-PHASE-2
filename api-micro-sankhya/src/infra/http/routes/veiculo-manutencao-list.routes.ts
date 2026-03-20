import { FastifyInstance, FastifyRequest } from 'fastify';
import { VeiculoManutencaoServiceImpl } from '../../../domain/services/veiculo-manutencao.service';
import { ValidationError } from '../../../domain/errors';

interface VeiculoParams {
  id: string;
}

interface HistoricoQuerystring {
  status?: string;
  tipo?: string;
  dataInicio?: string;
  dataFim?: string;
  page?: string;
  limit?: string;
}

interface CustosQuerystring {
  dataInicio?: string;
  dataFim?: string;
  page?: string;
  limit?: string;
}

interface ListQuerystring {
  page?: string;
  limit?: string;
}

function parseVeiculoId(id: string): number {
  const codveiculo = parseInt(id, 10);
  if (isNaN(codveiculo)) throw new ValidationError('Invalid vehicle ID');
  return codveiculo;
}

export async function veiculoManutencaoListRoutes(
  app: FastifyInstance,
  service: VeiculoManutencaoServiceImpl,
): Promise<void> {
  app.get(
    '/veiculos/:id/historico',
    async (
      request: FastifyRequest<{
        Params: VeiculoParams;
        Querystring: HistoricoQuerystring;
      }>,
    ) => {
      const codveiculo = parseVeiculoId(request.params.id);
      const { status, tipo, dataInicio, dataFim, page, limit } = request.query;
      return service.getHistorico(codveiculo, {
        status,
        tipo,
        dataInicio,
        dataFim,
        page: page ? parseInt(page, 10) : undefined,
        limit: limit ? parseInt(limit, 10) : undefined,
      });
    },
  );

  app.get(
    '/veiculos/:id/custos',
    async (
      request: FastifyRequest<{
        Params: VeiculoParams;
        Querystring: CustosQuerystring;
      }>,
    ) => {
      const codveiculo = parseVeiculoId(request.params.id);
      const { dataInicio, dataFim, page, limit } = request.query;
      return service.getCustos(codveiculo, {
        dataInicio,
        dataFim,
        page: page ? parseInt(page, 10) : undefined,
        limit: limit ? parseInt(limit, 10) : undefined,
      });
    },
  );

  app.get(
    '/veiculos/:id/retrabalho',
    async (
      request: FastifyRequest<{
        Params: VeiculoParams;
        Querystring: ListQuerystring;
      }>,
    ) => {
      const codveiculo = parseVeiculoId(request.params.id);
      const { page, limit } = request.query;
      return service.getRetrabalho(
        codveiculo,
        page ? parseInt(page, 10) : undefined,
        limit ? parseInt(limit, 10) : undefined,
      );
    },
  );
}
