import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { ApontamentosService } from '../../../domain/services/apontamentos.service';

const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
});

const periodoSchema = z.object({
  dtini: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, 'Formato: DD/MM/YYYY'),
  dtfim: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, 'Formato: DD/MM/YYYY'),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
});

const codveiculoParamSchema = z.object({
  codveiculo: z.coerce.number(),
});

const codveiculoQuerySchema = z.object({
  codveiculo: z.coerce.number().optional(),
});

const codigoSchema = z.object({
  codigo: z.coerce.number(),
});

const listarSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(25),
  orderBy: z.string().optional(),
  orderDir: z.enum(['ASC', 'DESC']).optional().default('DESC'),
  statusOs: z.string().optional(),
  codveiculo: z.coerce.number().optional(),
  dtInicio: z.string().optional(),
  dtFim: z.string().optional(),
  search: z.string().optional(),
});

export async function apontamentosRoutes(app: FastifyInstance) {
  const service = new ApontamentosService();

  app.get('/apontamentos/listar', async (request) => {
    const options = listarSchema.parse(request.query);
    return service.list(options);
  });

  app.get('/apontamentos/resumo', async () => {
    return service.getResumo();
  });

  app.get('/apontamentos/pendentes', async (request) => {
    const options = paginationSchema.parse(request.query);
    return service.getPendentes(options);
  });

  app.get('/apontamentos/com-os', async (request) => {
    const options = paginationSchema.parse(request.query);
    return service.getComOs(options);
  });

  app.get('/apontamentos/servicos-frequentes', async () => {
    return service.getServicosFrequentes();
  });

  app.get('/apontamentos/por-produto', async () => {
    return service.getByProduto();
  });

  app.get('/apontamentos/por-veiculo', async (request) => {
    const { codveiculo } = codveiculoQuerySchema.parse(request.query);
    return service.getByVeiculo(codveiculo);
  });

  app.get('/apontamentos/por-periodo', async (request) => {
    const options = periodoSchema.parse(request.query);
    return service.getByPeriodo(options);
  });

  app.get('/apontamentos/veiculo/:codveiculo/timeline', async (request) => {
    const { codveiculo } = codveiculoParamSchema.parse(request.params);
    const options = paginationSchema.parse(request.query);
    return service.getTimelineVeiculo(codveiculo, options);
  });

  app.get('/apontamentos/:codigo', async (request) => {
    const { codigo } = codigoSchema.parse(request.params);
    return service.getByApontamento(codigo);
  });

  const historicoServicoSchema = z.object({
    codveiculo: z.coerce.number(),
    codprod: z.coerce.number(),
  });

  app.get('/apontamentos/historico-servico', async (request) => {
    const { codveiculo, codprod } = historicoServicoSchema.parse(request.query);
    return service.getHistoricoServico(codveiculo, codprod);
  });
}
