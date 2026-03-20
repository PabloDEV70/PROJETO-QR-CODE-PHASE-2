import { FastifyInstance } from 'fastify';
import { EmTempoRealService } from '../../../domain/services/em-tempo-real.service';

export async function emTempoRealRoutes(app: FastifyInstance) {
  const service = new EmTempoRealService();

  app.get('/em-tempo-real/movimentacoes', async () => {
    return service.getMovimentacoes();
  });

  app.get('/em-tempo-real/resumo', async () => {
    return service.getResumo();
  });
}
