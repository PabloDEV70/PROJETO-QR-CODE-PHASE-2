import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { DbObjectsService } from '../../../domain/services/db-objects.service';

const listSchema = z.object({
  schema: z.string().optional(),
  termo: z.string().optional(),
  limite: z.coerce.number().min(1).max(500).optional(),
  offset: z.coerce.number().min(0).optional(),
});

const detalheSchema = z.object({
  schema: z.string(),
  nome: z.string(),
});

const truncarSchema = z.object({
  truncar: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
});

const relSchema = z.object({
  schema: z.string().optional(),
  limite: z.coerce.number().min(1).max(500).optional(),
  offset: z.coerce.number().min(0).optional(),
});

export async function dbObjectsRoutes(app: FastifyInstance) {
  const service = new DbObjectsService();

  app.get('/db/views', async (request) => {
    const opts = listSchema.parse(request.query);
    return service.getViews(opts);
  });

  app.get('/db/views/:schema/:nome', async (request) => {
    const { schema, nome } = detalheSchema.parse(request.params);
    const { truncar } = truncarSchema.parse(request.query);
    return service.getViewDetalhe(schema, nome, truncar);
  });

  app.get('/db/procedures', async (request) => {
    const opts = listSchema.parse(request.query);
    return service.getProcedures(opts);
  });

  app.get('/db/procedures/:schema/:nome', async (request) => {
    const { schema, nome } = detalheSchema.parse(request.params);
    const { truncar } = truncarSchema.parse(request.query);
    return service.getProcedureDetalhe(schema, nome, truncar);
  });

  app.get('/db/triggers', async (request) => {
    const opts = listSchema.parse(request.query);
    return service.getTriggers(opts);
  });

  app.get('/db/triggers/:schema/:nome', async (request) => {
    const { schema, nome } = detalheSchema.parse(request.params);
    const { truncar } = truncarSchema.parse(request.query);
    return service.getTriggerDetalhe(schema, nome, truncar);
  });

  app.get('/db/relacionamentos', async (request) => {
    const opts = relSchema.parse(request.query);
    return service.getRelacionamentos(opts);
  });

  app.get('/db/cache/estatisticas', async () => {
    return service.getCacheEstatisticas();
  });
}
