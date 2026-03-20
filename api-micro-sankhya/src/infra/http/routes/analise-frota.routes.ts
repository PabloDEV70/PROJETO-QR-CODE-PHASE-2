import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { AnaliseFrotaService } from '../../../domain/services/analise-frota.service';
import { QueryExecutor } from '../../api-mother/queryExecutor';

const periodoSchema = z.object({
  dataInicio: z.string().optional(),
  dataFim: z.string().optional(),
});

export const analiseFrotaRoutes = async (app: FastifyInstance) => {
  const service = new AnaliseFrotaService(new QueryExecutor());

  app.get('/veiculos/analise-frota', async (request) => {
    const { dataInicio, dataFim } = periodoSchema.parse(request.query);
    return service.getRanking(dataInicio, dataFim);
  });

  app.get('/veiculos/analise-frota/:codveiculo', async (request) => {
    const { codveiculo } = z.object({ codveiculo: z.coerce.number() }).parse(request.params);
    const [ranking, osHistory, notasComerciais] = await Promise.all([
      service.getRanking(),
      service.getDetalheOS(codveiculo),
      service.getNotasComerciais(codveiculo),
    ]);
    const veiculo = ranking.find((r) => r.codveiculo === codveiculo) ?? null;
    return { veiculo, osHistory, notasComerciais };
  });
};
