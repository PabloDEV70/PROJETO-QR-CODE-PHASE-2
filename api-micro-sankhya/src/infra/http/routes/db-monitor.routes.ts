import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { DbMonitorService } from '../../../domain/services/db-monitor.service';

const limiteSchema = z.object({
  limite: z.coerce.number().min(1).max(500).optional(),
});

const queriesPesadasSchema = z.object({
  limite: z.coerce.number().min(1).max(500).optional(),
  cpuMinimo: z.coerce.number().optional(),
});

export async function dbMonitorRoutes(app: FastifyInstance) {
  const service = new DbMonitorService();

  app.get('/db/monitor/queries-ativas', async () => {
    return service.getQueriesAtivas();
  });

  app.get('/db/monitor/queries-pesadas', async (request) => {
    const { limite, cpuMinimo } = queriesPesadasSchema.parse(request.query);
    return service.getQueriesPesadas(limite, cpuMinimo);
  });

  app.get('/db/monitor/estatisticas-query', async (request) => {
    const { limite } = limiteSchema.parse(request.query);
    return service.getEstatisticasQuery(limite);
  });

  app.get('/db/monitor/sessoes', async () => {
    return service.getSessoes();
  });

  app.get('/db/monitor/visao-servidor', async () => {
    return service.getVisaoServidor();
  });

  app.get('/db/monitor/estatisticas-espera', async (request) => {
    const { limite } = limiteSchema.parse(request.query);
    return service.getEstatisticasEspera(limite);
  });

  app.get('/db/monitor/permissoes', async () => {
    return service.getPermissoes();
  });
}
