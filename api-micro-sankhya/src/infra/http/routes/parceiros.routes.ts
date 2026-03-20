import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { ParceirosService } from '../../../domain/services/parceiros.service';
import { VALID_INCLUDES, PerfilInclude } from '../../../types/TGFPAR/perfil-include';
import { NotFoundError } from '../../../domain/errors';

const listSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
  tippessoa: z.enum(['F', 'J']).optional(),
  ativo: z.enum(['S', 'N']).optional(),
  searchTerm: z.string().optional(),
  orderBy: z.string().optional(),
  orderDir: z.enum(['ASC', 'DESC']).optional(),
  // Filtros por papel
  cliente: z.enum(['S', 'N']).optional(),
  fornecedor: z.enum(['S', 'N']).optional(),
  funcionario: z.enum(['S', 'N']).optional(),
  vendedor: z.enum(['S', 'N']).optional(),
  motorista: z.enum(['S', 'N']).optional(),
  usuario: z.enum(['S', 'N']).optional(),
  comprador: z.enum(['S', 'N']).optional(),
});

const searchSchema = z.object({
  q: z.string().min(1),
});

const idSchema = z.object({
  codparc: z.coerce.number(),
});

const perfilQuerySchema = z.object({
  include: z.string().optional(),
});

function parseIncludes(raw?: string): PerfilInclude[] {
  if (!raw) return [];
  return raw
    .split(',')
    .map(s => s.trim())
    .filter((s): s is PerfilInclude => VALID_INCLUDES.includes(s as PerfilInclude));
}

export async function parceirosRoutes(app: FastifyInstance) {
  const parceirosService = new ParceirosService();

  app.get('/parceiros', async (request, reply) => {
    const options = listSchema.parse(request.query);
    return parceirosService.list(options);
  });

  app.get('/parceiros/search', async (request, reply) => {
    const { q } = searchSchema.parse(request.query);
    return parceirosService.search(q);
  });

  app.get('/parceiros/:codparc', async (request) => {
    const { codparc } = idSchema.parse(request.params);
    const parceiro = await parceirosService.getById(codparc);
    if (!parceiro) throw new NotFoundError('Parceiro not found');
    return parceiro;
  });

  app.get('/parceiros/:codparc/perfil', async (request) => {
    const { codparc } = idSchema.parse(request.params);
    const { include } = perfilQuerySchema.parse(request.query);
    const includes = parseIncludes(include);
    const perfil = await parceirosService.getPerfilCompleto(codparc, includes);
    if (!perfil) throw new NotFoundError('Parceiro not found');
    return perfil;
  });

  app.get('/parceiros/:codparc/rdos', async (request, reply) => {
    const { codparc } = idSchema.parse(request.params);
    const { page = 1, limit = 50 } = request.query as { page?: number; limit?: number };

    return parceirosService.getRdos(codparc, {
      page: Number(page),
      limit: Number(limit),
    });
  });

  app.get('/parceiros/:codparc/os-manutencao', async (request, reply) => {
    const { codparc } = idSchema.parse(request.params);
    const { page = 1, limit = 50 } = request.query as { page?: number; limit?: number };

    return parceirosService.getOsManutencao(codparc, {
      page: Number(page),
      limit: Number(limit),
    });
  });
}
