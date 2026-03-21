import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { ComprasService } from '../../../domain/services/compras.service';

const requisicaoQuerySchema = z.object({
  tipo: z.enum(['compras', 'manutencao']).default('compras'),
});

export async function comprasRoutes(app: FastifyInstance) {
  const comprasService = new ComprasService();

  app.get('/compras/requisicoes', async (request) => {
    const { tipo } = requisicaoQuerySchema.parse(request.query);
    return comprasService.getRequisicoesPendentes(tipo);
  });

  app.get('/compras/cotacoes', async () => {
    return comprasService.getCotacoesPendentes();
  });

  app.get('/compras/resumo', async () => {
    return comprasService.getResumoDashboard();
  });

}
