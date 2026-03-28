import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { CorridasService } from '../../../domain/services/corridas.service';
import { CorridasStatsService } from '../../../domain/services/corridas-stats.service';
import { CorridasMutationService } from '../../../domain/services/corridas-mutation.service';
import { NotFoundError, ForbiddenError } from '../../../domain/errors';
import { getDatabase } from '../../api-mother/database-context';
import { logger } from '../../../shared/logger';

const BUSCAR_LEVAR_LABELS: Record<string, string> = {
  '0': 'Buscar',
  '1': 'Levar',
  '3': 'Levar e Buscar',
};

const listSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(200).default(20),
  status: z.enum(['0', '1', '2', '3']).optional(),
  motorista: z.coerce.number().optional(),
  solicitante: z.coerce.number().optional(),
  codparc: z.coerce.number().optional(),
  buscarLevar: z.enum(['0', '1', '3']).optional(),
  dataInicio: z.string().optional(),
  dataFim: z.string().optional(),
  search: z.string().optional(),
  orderBy: z.string().optional(),
  orderDir: z.enum(['ASC', 'DESC']).optional(),
});

const idSchema = z.object({
  id: z.coerce.number(),
});

const dateFilterSchema = z.object({
  dataInicio: z.string().optional(),
  dataFim: z.string().optional(),
});

const createSchema = z.object({
  USU_SOLICITANTE: z.number(),
  CODPARC: z.number().optional(),
  DESTINO: z.string().optional(),
  BUSCARLEVAR: z.enum(['0', '1', '3']).optional(),
  PASSAGEIROSMERCADORIA: z.string().optional(),
  OBS: z.string().optional(),
  PRIORIDADE: z.enum(['0', '1', '2']).optional(),
  DT_ACIONAMENTO: z.string().optional(),
  ENVIAWPP: z.enum(['S', 'N']).optional(),
});

const updateSchema = z.object({
  CODPARC: z.number().optional(),
  DESTINO: z.string().optional(),
  BUSCARLEVAR: z.enum(['0', '1', '3']).optional(),
  PASSAGEIROSMERCADORIA: z.string().optional(),
  OBS: z.string().optional(),
  PRIORIDADE: z.enum(['0', '1', '2']).optional(),
  DT_ACIONAMENTO: z.string().optional(),
  ENVIAWPP: z.enum(['S', 'N']).optional(),
});

const statusSchema = z.object({
  status: z.enum(['0', '1', '2', '3']),
  codUsu: z.number().optional(),
});

const assignSchema = z.object({
  codUsu: z.number(),
});

const localizacaoSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  accuracy: z.number().optional(),
});

const minhasSchema = z.object({
  role: z.enum(['solicitante', 'motorista']).optional(),
  status: z.enum(['0', '1', '2', '3']).optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
});

function requireMutableDatabase(userToken?: string) {
  const db = getDatabase();
  if (db === 'PROD' && !userToken) {
    throw new ForbiddenError(
      'Mutations in PROD require a logged-in user.',
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

function extractCodusu(request: { headers: { authorization?: string } }): number | null {
  const auth = request.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return null;
  try {
    const payload = JSON.parse(Buffer.from(auth.slice(7).split('.')[1], 'base64').toString());
    return Number(payload.sub) || null;
  } catch { return null; }
}

export async function corridasRoutes(app: FastifyInstance) {
  const service = new CorridasService();
  const statsService = new CorridasStatsService();
  const mutationService = new CorridasMutationService();

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

  // --- Read endpoints ---

  app.get('/corridas', async (request) => {
    const options = listSchema.parse(request.query);
    return timed('GET /corridas', () => service.getList(options));
  });

  app.get('/corridas/resumo', async () => {
    return timed('GET /corridas/resumo', async () => {
      const raw = await service.getResumo();
      const find = (s: string) => raw.porStatus.find((r) => r.status === s)?.total ?? 0;
      return {
        abertas: find('0'),
        emAndamento: find('1'),
        concluidas: find('2'),
        canceladas: find('3'),
        total: raw.total,
      };
    });
  });

  app.get('/corridas/motoristas', async () => {
    return timed('GET /corridas/motoristas', () => service.getMotoristas());
  });

  app.get('/corridas/motoristas-detalhado', async () => {
    return timed('GET /corridas/motoristas-detalhado', () => service.getMotoristasDetalhado());
  });

  app.get('/corridas/parceiros-busca', async (request) => {
    const { search } = z.object({ search: z.string().min(1) }).parse(request.query);
    return timed('GET /corridas/parceiros-busca', () => service.buscarParceiros(search));
  });

  // --- GPS & user-scoped endpoints (must be before :id catch-all) ---

  app.get('/corridas/minhas', async (request) => {
    const codusu = extractCodusu(request);
    if (!codusu) throw new ForbiddenError('Token invalido ou ausente');

    const options = minhasSchema.parse(request.query);
    return timed('GET /corridas/minhas', async () => {
      let role = options.role;
      if (!role) {
        const userRole = await service.getUserRole(codusu);
        role = userRole.isMotorista ? 'motorista' : 'solicitante';
      }
      return service.getMinhas({ codusu, role, status: options.status, limit: options.limit });
    });
  });

  app.get('/corridas/me/role', async (request) => {
    const codusu = extractCodusu(request);
    if (!codusu) throw new ForbiddenError('Token invalido ou ausente');

    return timed('GET /corridas/me/role', () => service.getUserRole(codusu));
  });

  app.patch('/corridas/minha-localizacao', async (request) => {
    const codusu = extractCodusu(request);
    if (!codusu) throw new ForbiddenError('Token invalido ou ausente');

    const body = localizacaoSchema.parse(request.body);
    return timed('PATCH /corridas/minha-localizacao', async () => {
      await service.saveMinhaLocalizacao(codusu, {
        lat: body.latitude,
        lng: body.longitude,
        accuracy: body.accuracy,
      });
      return { ok: true };
    });
  });

  app.get('/corridas/localizacoes-ativas', async () => {
    return timed('GET /corridas/localizacoes-ativas', () => service.getLocalizacoesAtivas());
  });

  app.patch('/corridas/:id/localizacao', async (request) => {
    const codusu = extractCodusu(request);
    if (!codusu) throw new ForbiddenError('Token invalido ou ausente');

    const { id } = idSchema.parse(request.params);
    const body = localizacaoSchema.parse(request.body);
    return timed(`PATCH /corridas/${id}/localizacao`, async () => {
      await service.saveLocalizacao(id, {
        lat: body.latitude,
        lng: body.longitude,
        accuracy: body.accuracy,
        codusu,
      });
      return { ok: true };
    });
  });

  app.get('/corridas/:id/localizacao', async (request) => {
    const { id } = idSchema.parse(request.params);
    return timed(`GET /corridas/${id}/localizacao`, () => service.getLocalizacao(id));
  });

  app.get('/corridas/:id', async (request) => {
    const { id } = idSchema.parse(request.params);
    return timed(`GET /corridas/${id}`, async () => {
      const corrida = await service.getById(id);
      if (!corrida) throw new NotFoundError('Corrida not found');
      return corrida;
    });
  });

  // --- Stats endpoints ---

  app.get('/corridas/stats/tempo-transito', async (request) => {
    const options = dateFilterSchema.parse(request.query);
    return timed('GET /corridas/stats/tempo-transito', async () => {
      const r = await statsService.getTempoTransito(options);
      return {
        avgMinutos: r.AVG_MINUTOS ?? 0,
        minMinutos: r.MIN_MINUTOS ?? 0,
        maxMinutos: r.MAX_MINUTOS ?? 0,
        totalConcluidas: 0,
      };
    });
  });

  app.get('/corridas/stats/por-motorista', async (request) => {
    const options = dateFilterSchema.parse(request.query);
    return timed('GET /corridas/stats/por-motorista', async () => {
      const rows = await statsService.getPorMotorista(options);
      return rows.map((r) => ({
        codigo: r.USU_MOTORISTA,
        nome: r.NOMEMOTORISTA,
        corridas: r.TOTAL,
      }));
    });
  });

  app.get('/corridas/stats/por-solicitante', async (request) => {
    const options = dateFilterSchema.parse(request.query);
    return timed('GET /corridas/stats/por-solicitante', async () => {
      const rows = await statsService.getPorSolicitante(options);
      return rows.map((r) => ({
        codigo: r.USU_SOLICITANTE,
        nome: r.NOMESOLICITANTE,
        corridas: r.TOTAL,
      }));
    });
  });

  app.get('/corridas/stats/por-parceiro', async (request) => {
    const options = dateFilterSchema.parse(request.query);
    return timed('GET /corridas/stats/por-parceiro', async () => {
      const rows = await statsService.getPorParceiro(options);
      return rows.map((r) => ({
        codigo: r.CODPARC,
        nome: r.NOMEPARC,
        corridas: r.TOTAL,
      }));
    });
  });

  app.get('/corridas/stats/volume-mensal', async () => {
    return timed('GET /corridas/stats/volume-mensal', async () => {
      const rows = await statsService.getVolumeMensal();
      return rows.map((r) => ({
        ano: r.ANO,
        mes: r.MES,
        corridas: r.TOTAL,
      }));
    });
  });

  app.get('/corridas/stats/por-tipo', async (request) => {
    const options = dateFilterSchema.parse(request.query);
    return timed('GET /corridas/stats/por-tipo', async () => {
      const rows = await statsService.getPorTipo(options);
      return rows.map((r) => ({
        tipo: r.BUSCARLEVAR,
        label: BUSCAR_LEVAR_LABELS[r.BUSCARLEVAR] ?? r.BUSCARLEVAR,
        corridas: r.TOTAL,
      }));
    });
  });

  app.get('/corridas/stats/por-hora', async (request) => {
    const options = dateFilterSchema.parse(request.query);
    return timed('GET /corridas/stats/por-hora', async () => {
      const rows = await statsService.getPorHora(options);
      return rows.map((r) => ({
        hora: r.HORA,
        corridas: r.TOTAL,
      }));
    });
  });

  // --- Mutation endpoints ---

  app.post('/corridas', async (request, reply) => {
    const userToken = extractUserToken(request);
    const db = requireMutableDatabase(userToken);
    const body = createSchema.parse(request.body);
    logger.info({ db, body }, '[MUTATION] POST /corridas');
    const result = await mutationService.createCorrida(body, userToken);
    logger.info({ db, result }, '[MUTATION] POST /corridas - result');
    reply.status(201);
    return result;
  });

  app.put('/corridas/:id', async (request) => {
    const userToken = extractUserToken(request);
    const db = requireMutableDatabase(userToken);
    const { id } = idSchema.parse(request.params);
    const body = updateSchema.parse(request.body);
    logger.info({ db, id, body }, '[MUTATION] PUT /corridas/:id');
    const result = await mutationService.updateCorrida(id, body, userToken);
    logger.info({ db, id, result }, '[MUTATION] PUT /corridas/:id - result');
    return result;
  });

  app.patch('/corridas/:id/status', async (request) => {
    const userToken = extractUserToken(request);
    const db = requireMutableDatabase(userToken);
    const { id } = idSchema.parse(request.params);
    const { status, codUsu } = statusSchema.parse(request.body);
    logger.info({ db, id, status, codUsu }, '[MUTATION] PATCH status');
    const result = await mutationService.updateStatus(id, status, codUsu, userToken);
    logger.info({ db, id, result }, '[MUTATION] PATCH status - result');
    return result;
  });

  app.patch('/corridas/:id/motorista', async (request) => {
    const userToken = extractUserToken(request);
    const db = requireMutableDatabase(userToken);
    const { id } = idSchema.parse(request.params);
    const { codUsu } = assignSchema.parse(request.body);
    logger.info({ db, id, codUsu }, '[MUTATION] PATCH motorista');
    const result = await mutationService.assignMotorista(id, codUsu, userToken);
    logger.info({ db, id, codUsu, result }, '[MUTATION] PATCH motorista - result');
    return result;
  });
}
