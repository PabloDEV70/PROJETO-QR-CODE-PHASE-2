import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { DbAuditService } from '../../../domain/services/db-audit.service';
import { adminGuard } from '../plugins/admin-guard';

const historicoSchema = z.object({
  tabela: z.string().optional(),
  usuario: z.string().optional(),
  operacao: z.string().optional(),
  page: z.coerce.number().min(1).default(1).optional(),
  limit: z.coerce.number().min(1).max(100).default(50).optional(),
});

const estatisticasSchema = z.object({
  tabela: z.string().optional(),
});

export async function dbAuditRoutes(app: FastifyInstance) {
  app.addHook('onRequest', adminGuard);
  const service = new DbAuditService();

  app.get('/db/audit/historico', async (request) => {
    const filters = historicoSchema.parse(request.query);
    return service.getHistorico(filters);
  });

  app.get('/db/audit/estatisticas', async (request) => {
    const { tabela } = estatisticasSchema.parse(request.query);
    return service.getEstatisticas(tabela);
  });
}
