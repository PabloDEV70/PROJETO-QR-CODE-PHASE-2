import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { PatrimonioService } from '../../../domain/services/patrimonio.service';
import { NotFoundError } from '../../../domain/errors';

const listSchema = z.object({
  search: z.string().optional(),
  categoria: z.string().optional(),
  status: z.enum(['todos', 'ativo', 'baixado']).default('todos'),
  mobilizado: z.enum(['todos', 'sim', 'nao']).default('todos'),
  temPatrimonio: z.enum(['todos', 'sim', 'nao']).default('todos'),
  empresa: z.coerce.number().optional(),
});

const codbemSchema = z.object({
  codbem: z.string().min(1),
});

const codprodQuerySchema = z.object({
  codprod: z.coerce.number().default(0),
});

export async function patrimonioRoutes(app: FastifyInstance) {
  const service = new PatrimonioService();

  app.get('/patrimonio/dashboard', async () => {
    return service.getDashboard();
  });

  app.get('/patrimonio/bens', async (request) => {
    const filters = listSchema.parse(request.query);
    return service.listBens(filters);
  });

  app.get('/patrimonio/bens/:codbem', async (request) => {
    const { codbem } = codbemSchema.parse(request.params);
    const { codprod } = codprodQuerySchema.parse(request.query);
    const bem = await service.getBemDetalhe(codbem, codprod);
    if (!bem) throw new NotFoundError('Bem nao encontrado');
    return bem;
  });

  app.get('/patrimonio/bens/:codbem/mobilizacao', async (request) => {
    const { codbem } = codbemSchema.parse(request.params);
    return service.getBemMobilizacao(codbem);
  });

  app.get('/patrimonio/bens/:codbem/localizacao', async (request) => {
    const { codbem } = codbemSchema.parse(request.params);
    return service.getBemLocalizacao(codbem);
  });

  app.get('/patrimonio/bens/:codbem/documentos', async (request) => {
    const { codbem } = codbemSchema.parse(request.params);
    return service.getBemDocumentos(codbem);
  });

  app.get('/patrimonio/bens/:codbem/os', async (request) => {
    const { codbem } = codbemSchema.parse(request.params);
    return service.getBemOsHistorico(codbem);
  });

  app.get('/patrimonio/bens/:codbem/depreciacao', async (request) => {
    const { codbem } = codbemSchema.parse(request.params);
    const { codprod } = codprodQuerySchema.parse(request.query);
    return service.getBemDepreciacao(codbem, codprod);
  });

  app.get('/patrimonio/mobilizacao', async () => {
    return service.getMobilizacaoPorCliente();
  });

  app.get('/patrimonio/mobilizacao/veiculos', async () => {
    return service.getMobilizacaoPorVeiculo();
  });

  app.get('/patrimonio/depreciacao', async () => {
    return service.getDepreciacaoConsolidada();
  });

  app.get('/patrimonio/categorias', async () => {
    return service.getCategoriasResumo();
  });
}
