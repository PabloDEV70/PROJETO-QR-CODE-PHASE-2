import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { ChamadosService } from '../../../domain/services/chamados.service';
import { ChamadosMutationService } from '../../../domain/services/chamados-mutation.service';
import { getOcorrencias, getAnexos, getPorSetor } from '../../../domain/services/chamados.helpers';
import { NotFoundError, ForbiddenError } from '../../../domain/errors';
import { getDatabase } from '../../api-mother/database-context';
import { logger } from '../../../shared/logger';

const listSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(200).default(50),
  status: z.enum(['P', 'E', 'S', 'A', 'C', 'F']).optional(),
  prioridade: z.enum(['A', 'M', 'B']).optional(),
  tipoChamado: z.string().optional(),
  codparc: z.coerce.number().optional(),
  solicitante: z.coerce.number().optional(),
  solicitado: z.coerce.number().optional(),
  dataInicio: z.string().optional(),
  dataFim: z.string().optional(),
  orderBy: z.string().optional(),
  orderDir: z.enum(['ASC', 'DESC']).optional(),
  search: z.string().optional(),
  setor: z.string().optional(),
});

const kanbanSchema = z.object({
  dataInicio: z.string().optional(),
  dataFim: z.string().optional(),
  search: z.string().optional(),
  setor: z.string().optional(),
  prioridade: z.enum(['A', 'M', 'B']).optional(),
  tipoChamado: z.string().optional(),
  codparc: z.coerce.number().optional(),
  solicitante: z.coerce.number().optional(),
  solicitado: z.coerce.number().optional(),
});

const chatListSchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(30),
  offset: z.coerce.number().min(0).default(0),
  status: z.enum(['P', 'E', 'S', 'A', 'C', 'F']).optional(),
  statusExclude: z.string().optional(),
  search: z.string().optional(),
  solicitante: z.coerce.number().optional(),
  codgrupo: z.coerce.number().optional(),
  scopeUser: z.coerce.number().optional(),
});

const nuchamadoSchema = z.object({
  nuchamado: z.coerce.number(),
});

const createSchema = z.object({
  DESCRCHAMADO: z.string().min(1),
  STATUS: z.enum(['P', 'E', 'S', 'A', 'C', 'F']).optional(),
  PRIORIDADE: z.enum(['A', 'M', 'B']).optional(),
  TIPOCHAMADO: z.string().optional(),
  SOLICITANTE: z.number(),
  SOLICITADO: z.number().optional(),
  CODPARC: z.number().optional(),
  DHPREVENTREGA: z.string().optional(),
  SETOR: z.string().optional(),
  FINALIZADOPOR: z.number().optional(),
  DHFINCHAM: z.string().optional(),
  DHCHAMADO: z.string().optional(),
  VALIDADOPOR: z.number().optional(),
  DHVALIDACAO: z.string().optional(),
  VALIDADO: z.enum(['S', 'N']).optional(),
});

const updateSchema = z.object({
  DESCRCHAMADO: z.string().min(1).optional(),
  STATUS: z.enum(['P', 'E', 'S', 'A', 'C', 'F']).optional(),
  PRIORIDADE: z.enum(['A', 'M', 'B']).optional(),
  TIPOCHAMADO: z.string().optional(),
  SOLICITANTE: z.number().optional(),
  SOLICITADO: z.number().optional(),
  FINALIZADOPOR: z.number().optional(),
  CODPARC: z.number().optional(),
  DHPREVENTREGA: z.string().optional(),
  SETOR: z.string().optional(),
});

const statusSchema = z.object({
  status: z.enum(['P', 'E', 'S', 'A', 'C', 'F']),
  codUsu: z.number().optional(),
});

const ocorrenciaSchema = z.object({
  DESCROCORRENCIA: z.string().min(1),
  CODUSU: z.number().optional(),
});

function requireMutableDatabase(userToken?: string) {
  const db = getDatabase();
  if (db === 'PROD' && !userToken) {
    throw new ForbiddenError(
      'Mutations in PROD require a logged-in user. Agents/service accounts are blocked.',
      { currentDatabase: db },
    );
  }
  return db;
}

function extractUserToken(request: { headers: { authorization?: string } }): string | undefined {
  const auth = request.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return undefined;
  return auth.slice(7);
}

export async function chamadosRoutes(app: FastifyInstance) {
  const chamadosService = new ChamadosService();
  const mutationService = new ChamadosMutationService();

  // Timing wrapper for route handlers
  function timed<T>(routeName: string, fn: () => Promise<T>): Promise<T> {
    const t0 = Date.now();
    logger.info('[ROUTE] >>> %s START', routeName);
    return fn()
      .then((result) => {
        const ms = Date.now() - t0;
        const logFn = ms > 3000 ? logger.warn.bind(logger) : logger.info.bind(logger);
        logFn('[ROUTE] <<< %s DONE in %dms', routeName, ms);
        return result;
      })
      .catch((err) => {
        const ms = Date.now() - t0;
        logger.error('[ROUTE] <<< %s FAIL in %dms | %s', routeName, ms,
          err instanceof Error ? err.message : String(err));
        throw err;
      });
  }

  app.get('/chamados', async (request) => {
    const options = listSchema.parse(request.query);
    return timed('GET /chamados', () => chamadosService.getList(options));
  });

  app.get('/chamados/resumo', async () => {
    return timed('GET /chamados/resumo', () => chamadosService.getResumo());
  });

  app.get('/chamados/kanban', async (request) => {
    const options = kanbanSchema.parse(request.query);
    return timed('GET /chamados/kanban', () => chamadosService.getKanban(options));
  });

  app.get('/chamados/por-setor', async () => {
    return timed('GET /chamados/por-setor', () => getPorSetor());
  });

  app.get('/chamados/usuarios', async () => {
    return timed('GET /chamados/usuarios', () => chamadosService.getUsuarios());
  });

  app.get('/chamados/chat-list', async (request) => {
    const options = chatListSchema.parse(request.query);
    return timed('GET /chamados/chat-list', () => chamadosService.getChatList(options));
  });

  app.get('/chamados/:nuchamado', async (request) => {
    const { nuchamado } = nuchamadoSchema.parse(request.params);
    return timed(`GET /chamados/${nuchamado}`, async () => {
      const chamado = await chamadosService.getById(nuchamado);
      if (!chamado) throw new NotFoundError('Chamado not found');
      return chamado;
    });
  });

  app.get('/chamados/:nuchamado/ocorrencias', async (request) => {
    const { nuchamado } = nuchamadoSchema.parse(request.params);
    return timed(`GET /chamados/${nuchamado}/ocorrencias`, () => getOcorrencias(nuchamado));
  });

  app.get('/chamados/:nuchamado/anexos', async (request) => {
    const { nuchamado } = nuchamadoSchema.parse(request.params);
    return timed(`GET /chamados/${nuchamado}/anexos`, () => getAnexos(nuchamado));
  });

  // --- Mutation endpoints (TESTE/TREINA only) ---

  app.post('/chamados', async (request, reply) => {
    const userToken = extractUserToken(request);
    const db = requireMutableDatabase(userToken);
    const body = createSchema.parse(request.body);
    logger.info({ db, body }, '[MUTATION] POST /chamados - creating chamado');
    const result = await mutationService.createChamado(body, userToken);
    logger.info({ db, result }, '[MUTATION] POST /chamados - result');
    reply.status(201);
    return result;
  });

  app.put('/chamados/:nuchamado', async (request) => {
    const userToken = extractUserToken(request);
    const db = requireMutableDatabase(userToken);
    const { nuchamado } = nuchamadoSchema.parse(request.params);
    const body = updateSchema.parse(request.body);
    logger.info({ db, nuchamado, body }, '[MUTATION] PUT /chamados/:nuchamado - updating');
    const result = await mutationService.updateChamado(nuchamado, body, userToken);
    logger.info({ db, nuchamado, result }, '[MUTATION] PUT /chamados/:nuchamado - result');
    return result;
  });

  app.patch('/chamados/:nuchamado/status', async (request) => {
    const userToken = extractUserToken(request);
    const db = requireMutableDatabase(userToken);
    const { nuchamado } = nuchamadoSchema.parse(request.params);
    const { status, codUsu } = statusSchema.parse(request.body);
    logger.info({ db, nuchamado, status, codUsu }, '[MUTATION] PATCH status');
    const result = await mutationService.updateStatus(nuchamado, status, codUsu, userToken);
    logger.info({ db, nuchamado, result }, '[MUTATION] PATCH status - result');
    return result;
  });

  app.post('/chamados/:nuchamado/ocorrencias', async (request, reply) => {
    const userToken = extractUserToken(request);
    const db = requireMutableDatabase(userToken);
    const { nuchamado } = nuchamadoSchema.parse(request.params);
    const body = ocorrenciaSchema.parse(request.body);
    logger.info({ db, nuchamado, body }, '[MUTATION] POST ocorrencia');
    const result = await mutationService.addOcorrencia({
      NUCHAMADO: nuchamado,
      ...body,
    }, userToken);
    logger.info({ db, nuchamado, result }, '[MUTATION] POST ocorrencia - result');
    reply.status(201);
    return result;
  });

  const deleteOcorrenciaSchema = z.object({
    nuchamado: z.coerce.number(),
    sequencia: z.coerce.number(),
  });

  app.delete('/chamados/:nuchamado/ocorrencias/:sequencia', async (request) => {
    const userToken = extractUserToken(request);
    const db = requireMutableDatabase(userToken);
    const { nuchamado, sequencia } = deleteOcorrenciaSchema.parse(request.params);
    logger.info({ db, nuchamado, sequencia }, '[MUTATION] DELETE ocorrencia');
    const result = await mutationService.deleteOcorrencia(nuchamado, sequencia, userToken);
    logger.info({ db, nuchamado, sequencia, result }, '[MUTATION] DELETE ocorrencia - result');
    return result;
  });
}
