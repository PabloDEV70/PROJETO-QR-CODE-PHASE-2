import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { SeriesService } from '../../../domain/services/series.service';

const codProdSchema = z.object({
  codProd: z.string().regex(/^\d+$/).transform(Number),
});

const codUsuSchema = z.object({
  codusu: z.string().regex(/^\d+$/).transform(Number),
});

const codParcSchema = z.object({
  codparc: z.string().regex(/^\d+$/).transform(Number),
});

const codProdSerieSchema = z.object({
  codProd: z.string().regex(/^\d+$/).transform(Number),
  serie: z.string().min(1),
});

const buscarSchema = z.object({
  q: z.string().min(1),
});

export async function seriesRoutes(app: FastifyInstance) {
  const service = new SeriesService();

  app.get('/series/produtos', async () => {
    return service.getProdutosComSeries();
  });

  app.get('/series/empenhados', async () => {
    return service.getColaboradoresComMateriais();
  });

  app.get('/series/empenhados/usuario/:codusu', async (request, reply) => {
    const parsed = codUsuSchema.safeParse(request.params);
    if (!parsed.success) {
      return reply.status(400).send({
        error: 'Invalid codusu parameter',
        details: parsed.error.flatten(),
      });
    }
    return service.getMateriaisDoUsuario(parsed.data.codusu);
  });

  app.get('/series/empenhados/parceiro/:codparc', async (request, reply) => {
    const parsed = codParcSchema.safeParse(request.params);
    if (!parsed.success) {
      return reply.status(400).send({
        error: 'Invalid codparc parameter',
        details: parsed.error.flatten(),
      });
    }
    return service.getMateriaisDoParceiro(parsed.data.codparc);
  });

  app.get('/series/buscar', async (request, reply) => {
    const parsed = buscarSchema.safeParse(request.query);
    if (!parsed.success) {
      return reply.status(400).send({
        error: 'Query parameter "q" is required',
        details: parsed.error.flatten(),
      });
    }
    return service.buscarSerie(parsed.data.q);
  });

  app.get('/series/:codProd', async (request, reply) => {
    const parsed = codProdSchema.safeParse(request.params);
    if (!parsed.success) {
      return reply.status(400).send({
        error: 'Invalid codProd parameter',
        details: parsed.error.flatten(),
      });
    }
    return service.getSeriesPorProduto(parsed.data.codProd);
  });

  app.get('/series/:codProd/:serie', async (request, reply) => {
    const parsed = codProdSerieSchema.safeParse(request.params);
    if (!parsed.success) {
      return reply.status(400).send({
        error: 'Invalid parameters',
        details: parsed.error.flatten(),
      });
    }
    return service.getHistoricoSerie(parsed.data.codProd, parsed.data.serie);
  });
}
