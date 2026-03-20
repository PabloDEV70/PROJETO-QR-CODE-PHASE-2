import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { UsuariosService } from '../../../domain/services/usuarios.service';
import { NotFoundError } from '../../../domain/errors';

const listSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
  ativo: z.enum(['S', 'N']).optional(),
  codemp: z.coerce.number().optional(),
  orderBy: z.string().optional(),
  orderDir: z.enum(['ASC', 'DESC']).optional(),
});

const searchSchema = z.object({
  q: z.string().default(''),
  ativo: z.enum(['S', 'N']).default('S'),
  departamento: z.string().optional(),
});

const idSchema = z.object({
  codusu: z.coerce.number(),
});

export async function usuariosRoutes(app: FastifyInstance) {
  const usuariosService = new UsuariosService();

  app.get('/usuarios', async (request) => {
    const options = listSchema.parse(request.query);
    return usuariosService.list(options);
  });

  app.get('/usuarios/search', async (request) => {
    const { q, ativo, departamento } = searchSchema.parse(request.query);
    return usuariosService.search(q, ativo, departamento);
  });

  app.get('/usuarios/:codusu', async (request) => {
    const { codusu } = idSchema.parse(request.params);
    const usuario = await usuariosService.getById(codusu);
    if (!usuario) throw new NotFoundError('Usuario not found');
    return usuario;
  });
}
