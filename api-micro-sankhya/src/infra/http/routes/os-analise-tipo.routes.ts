import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { OsAnaliseTipoService } from '../../../domain/services/os-analise-tipo.service';
import { logger } from '../../../shared/logger';

const analiseSchema = z.object({
  dataInicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  dataFim: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

const tendenciaSchema = z.object({
  tipoVeiculo: z.string().min(1),
});

export async function osAnaliseTipoRoutes(app: FastifyInstance) {
  const service = new OsAnaliseTipoService();

  app.get('/os/analise-tipo-veiculo', async (request, reply) => {
    const parsed = analiseSchema.safeParse(request.query);
    if (!parsed.success) {
      return reply.status(400).send({
        error: 'Invalid query parameters',
        details: parsed.error.flatten(),
      });
    }
    try {
      return await service.getAnalisePorTipo(parsed.data);
    } catch (err) {
      logger.error({ err }, '[os-analise-tipo] getAnalisePorTipo failed');
      return reply.status(500).send({
        error: 'Failed to fetch analise por tipo',
        message: err instanceof Error ? err.message : String(err),
      });
    }
  });

  app.get('/os/analise-tipo-veiculo/tendencia', async (request, reply) => {
    const parsed = tendenciaSchema.safeParse(request.query);
    if (!parsed.success) {
      return reply.status(400).send({
        error: 'Invalid query parameters',
        details: parsed.error.flatten(),
      });
    }
    try {
      return await service.getTendenciaPorTipo(parsed.data.tipoVeiculo);
    } catch (err) {
      logger.error({ err }, '[os-analise-tipo] getTendenciaPorTipo failed');
      return reply.status(500).send({
        error: 'Failed to fetch tendencia',
        message: err instanceof Error ? err.message : String(err),
      });
    }
  });
}
