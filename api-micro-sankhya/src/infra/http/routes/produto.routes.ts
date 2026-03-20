import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { ProdutoService } from '../../../domain/services/produto.service';

const buscarSchema = z.object({
  q: z.string().min(2).max(100).optional(),
  grupo: z.string().optional(),
  usoprod: z.enum(['S', 'P']).optional(),
  limit: z.coerce.number().min(1).max(50).default(30),
});

const codProdSchema = z.object({
  codProd: z.coerce.number(),
});

export async function produtoRoutes(app: FastifyInstance) {
  const service = new ProdutoService();

  app.get('/produtos/buscar', async (request) => {
    const opts = buscarSchema.parse(request.query);
    return service.buscar(opts);
  });

  app.get('/produtos/grupos', async () => {
    return service.getGrupos();
  });

  app.get('/produtos/:codProd/full', async (request) => {
    const { codProd } = codProdSchema.parse(request.params);
    return service.getById(codProd);
  });

  app.get('/produtos/:codProd/estoque', async (request) => {
    const { codProd } = codProdSchema.parse(request.params);
    return service.getEstoque(codProd);
  });

  app.get('/produtos/:codProd/placas', async (request) => {
    const { codProd } = codProdSchema.parse(request.params);
    return service.getPlacas(codProd);
  });
}
