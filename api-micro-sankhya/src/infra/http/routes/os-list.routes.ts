import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { OsListService } from '../../../domain/services/os-list.service';

const listSchema = z.object({
  dataInicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  dataFim: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  codveiculo: z.string().optional(),
  codusuexec: z.string().optional(),
  codparcexec: z.string().optional(),
  status: z.enum(['A', 'E', 'F', 'C', 'R']).optional(),
  tipo: z.enum(['I', 'E']).optional(),
  manutencao: z.enum(['C', 'P', 'O', 'S', 'R', 'T', '1', '2', '3', '4', '5']).optional(),
  statusGig: z.enum(['MA', 'AI', 'AV', 'SI', 'AN', 'SN']).optional(),
  search: z.string().optional(),
  page: z.string().transform(Number).default(1),
  limit: z.string().transform(Number).default(30),
});

const colabSchema = z.object({
  codusu: z.string().optional(),
  codparc: z.string().optional(),
  dataInicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  dataFim: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
}).refine((d) => d.codusu || d.codparc, {
  message: 'codusu or codparc is required',
});

const ativasSchema = z.object({
  codparcexec: z.string().optional(),
  placa: z.string().optional(),
});

export async function osListRoutes(app: FastifyInstance) {
  const service = new OsListService();

  // Optimized: single query for all active OS (A + E)
  app.get('/os/ativas', async (request) => {
    const opts = ativasSchema.parse(request.query);
    return service.listAtivas(opts);
  });

  app.get('/os/list', async (request, reply) => {
    const parsed = listSchema.safeParse(request.query);
    if (!parsed.success) {
      return reply.status(400).send({
        error: 'Invalid query parameters',
        details: parsed.error.flatten(),
      });
    }
    return service.list(parsed.data);
  });

  app.get('/os/resumo', async (request, reply) => {
    const parsed = listSchema.safeParse(request.query);
    if (!parsed.success) {
      return reply.status(400).send({
        error: 'Invalid query parameters',
        details: parsed.error.flatten(),
      });
    }
    return service.getResumo(parsed.data);
  });

  app.get('/os/colab-servicos', async (request, reply) => {
    const parsed = colabSchema.safeParse(request.query);
    if (!parsed.success) {
      return reply.status(400).send({
        error: 'codusu is required',
        details: parsed.error.flatten(),
      });
    }
    return service.getColabServicos(parsed.data);
  });
}
