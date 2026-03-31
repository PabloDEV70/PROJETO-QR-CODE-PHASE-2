import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { HstVeiService } from '../../../domain/services/hstvei.service';
import { HstVeiMutationService } from '../../../domain/services/hstvei-mutation.service';
import { NotFoundError } from '../../../domain/errors/app-error';
import { extractUserToken } from '../../../shared/utils/extract-token';

const service = new HstVeiService();
const mutation = new HstVeiMutationService();

const idSchema = z.object({ id: z.coerce.number().positive() });
const codveiculoSchema = z.object({ codveiculo: z.coerce.number().positive() });

const listSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(200).default(50),
  codveiculo: z.coerce.number().optional(),
  idsit: z.coerce.number().optional(),
  idpri: z.coerce.number().optional(),
  coddep: z.coerce.number().optional(),
  ativas: z.enum(['true', 'false']).optional(),
  busca: z.string().max(100).optional(),
  orderBy: z.string().optional(),
  orderDir: z.enum(['ASC', 'DESC']).optional(),
});

const historicoSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
});

const criarSchema = z.object({
  codveiculo: z.number().positive(),
  idsit: z.number().positive(),
  idpri: z.number().min(0).max(3).optional(),
  descricao: z.string().max(500).optional(),
  obs: z.string().max(1000).optional(),
  dtinicio: z.string().optional(),
  dtprevisao: z.string().optional(),
  nunota: z.number().optional(),
  nuos: z.number().optional(),
  numos: z.number().optional(),
  codparc: z.number().optional(),
  exeope: z.string().max(250).optional(),
  exemec: z.string().max(250).optional(),
  codUsuInc: z.number().optional(),
});

const atualizarSchema = z.object({
  idsit: z.number().optional(),
  idpri: z.number().min(0).max(3).nullable().optional(),
  descricao: z.string().max(500).nullable().optional(),
  obs: z.string().max(1000).nullable().optional(),
  dtinicio: z.string().nullable().optional(),
  dtprevisao: z.string().nullable().optional(),
  dtfim: z.string().nullable().optional(),
  nunota: z.number().nullable().optional(),
  nuos: z.number().nullable().optional(),
  numos: z.number().nullable().optional(),
  codparc: z.number().nullable().optional(),
  exeope: z.string().max(250).nullable().optional(),
  exemec: z.string().max(250).nullable().optional(),
  codUsuAlt: z.number().optional(),
});

const trocarSchema = z.object({
  idsit: z.number().positive(),
  idpri: z.number().min(0).max(3).optional(),
  descricao: z.string().max(500).optional(),
  obs: z.string().max(1000).optional(),
  dtinicio: z.string().optional(),
  dtprevisao: z.string().optional(),
  nunota: z.number().optional(),
  nuos: z.number().optional(),
  numos: z.number().optional(),
  codparc: z.number().optional(),
  exeope: z.string().max(250).optional(),
  exemec: z.string().max(250).optional(),
  codUsuAlt: z.number().optional(),
});

function extractCodusu(request: { headers: { authorization?: string } }): number {
  try {
    const token = request.headers.authorization?.replace('Bearer ', '');
    if (!token) return 0;
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    const codusu = Number(payload.sub);
    return isNaN(codusu) ? 0 : codusu;
  } catch { return 0; }
}

export async function hstveiRoutes(app: FastifyInstance) {
  // --- Queries ---

  app.get('/hstvei', async (request) => {
    const query = listSchema.parse(request.query);
    return service.list({
      ...query,
      ativas: query.ativas === 'true' ? true : query.ativas === 'false' ? false : undefined,
    });
  });

  app.get('/hstvei/painel', async () => {
    return service.getPainel();
  });

  app.get('/hstvei/proximos', async () => {
    return service.getProximosLiberar();
  });

  app.get('/hstvei/stats', async () => {
    return service.getStats();
  });

  app.get('/hstvei/operadores', async () => {
    return service.getOperadores();
  });

  app.get('/hstvei/situacoes', async () => {
    return service.getSituacoes();
  });

  app.get('/hstvei/prioridades', async () => {
    return service.getPrioridades();
  });

  app.get('/hstvei/:id', async (request) => {
    const { id } = idSchema.parse(request.params);
    const item = await service.getById(id);
    if (!item) throw new NotFoundError('Situação não encontrada');
    return item;
  });

  app.get('/hstvei/:id/cadeia-notas', async (request) => {
    const { id } = idSchema.parse(request.params);
    const item = await service.getById(id);
    if (!item) throw new NotFoundError('Situação não encontrada');
    if (!item.NUNOTA) return [];
    return service.getCadeiaNotas(item.NUNOTA);
  });

  app.get('/hstvei/:id/itens-nota', async (request) => {
    const { id } = idSchema.parse(request.params);
    const item = await service.getById(id);
    if (!item) throw new NotFoundError('Situação não encontrada');
    if (!item.NUNOTA) return [];
    return service.getItensNota(item.NUNOTA);
  });

  app.get('/hstvei/veiculo/:codveiculo', async (request) => {
    const { codveiculo } = codveiculoSchema.parse(request.params);
    return service.getAtivasPorVeiculo(codveiculo);
  });

  app.get('/hstvei/veiculo/:codveiculo/historico', async (request) => {
    const { codveiculo } = codveiculoSchema.parse(request.params);
    const query = historicoSchema.parse(request.query);
    return service.getHistorico(codveiculo, query.page, query.limit);
  });

  // --- Mutations ---

  app.post('/hstvei', async (request) => {
    const body = criarSchema.parse(request.body);
    const codusu = body.codUsuInc ?? extractCodusu(request);
    const userToken = extractUserToken(request);
    return mutation.criar(body, codusu, userToken);
  });

  app.put('/hstvei/:id', async (request) => {
    const { id } = idSchema.parse(request.params);
    const body = atualizarSchema.parse(request.body);
    const codusu = body.codUsuAlt ?? extractCodusu(request);
    const userToken = extractUserToken(request);
    return mutation.atualizar(id, body, codusu, userToken);
  });

  app.patch('/hstvei/:id/encerrar', async (request) => {
    const { id } = idSchema.parse(request.params);
    const body = request.body as { codUsuAlt?: number };
    const codusu = body.codUsuAlt ?? extractCodusu(request);
    const userToken = extractUserToken(request);
    return mutation.encerrar(id, codusu, userToken);
  });

  app.patch('/hstvei/:id/trocar-situacao', async (request) => {
    const { id } = idSchema.parse(request.params);
    const body = trocarSchema.parse(request.body);
    const codusu = body.codUsuAlt ?? extractCodusu(request);
    const userToken = extractUserToken(request);

    const atual = await service.getById(id);
    if (!atual) throw new NotFoundError('Situação não encontrada');

    return mutation.trocarSituacao(id, { codveiculo: atual.CODVEICULO, ...body }, codusu, userToken);
  });
}
