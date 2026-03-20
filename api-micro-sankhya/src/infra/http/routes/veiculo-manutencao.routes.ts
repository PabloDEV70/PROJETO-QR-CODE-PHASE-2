import { FastifyInstance } from 'fastify';
import { veiculoManutencaoService } from '../../../domain/services/veiculo-manutencao.service';
import { veiculoManutencaoDetailRoutes } from './veiculo-manutencao-detail.routes';
import { veiculoManutencaoListRoutes } from './veiculo-manutencao-list.routes';
import { veiculoManutencaoFrotaRoutes } from './veiculo-manutencao-frota.routes';

export async function veiculoManutencaoRoutes(app: FastifyInstance): Promise<void> {
  const service = veiculoManutencaoService;

  await veiculoManutencaoDetailRoutes(app, service);
  await veiculoManutencaoListRoutes(app, service);
  await veiculoManutencaoFrotaRoutes(app, service);
}
