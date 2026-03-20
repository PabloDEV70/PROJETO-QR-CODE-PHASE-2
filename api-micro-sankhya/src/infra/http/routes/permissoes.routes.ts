import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { PermissoesService } from '../../../domain/services/permissoes.service';
import { NotFoundError } from '../../../domain/errors';

const listarSchema = z.object({
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
  termo: z.string().optional(),
});

const codgrupoSchema = z.object({
  codgrupo: z.coerce.number(),
});

const codusuSchema = z.object({
  codusu: z.coerce.number(),
});

const idacessoSchema = z.object({
  idacesso: z.string(),
});

export async function permissoesRoutes(app: FastifyInstance) {
  const service = new PermissoesService();

  app.get('/permissoes/resumo', async () => {
    return service.getResumo();
  });

  app.get('/permissoes/telas', async (request) => {
    const params = listarSchema.parse(request.query);
    return service.getTelas(params);
  });

  app.get('/permissoes/telas/:idacesso', async (request) => {
    const { idacesso } = idacessoSchema.parse(request.params);
    return service.getTelaDetalhes(idacesso);
  });

  app.get('/permissoes/grupos', async () => {
    return service.getGrupos();
  });

  app.get('/permissoes/grupos/:codgrupo', async (request) => {
    const { codgrupo } = codgrupoSchema.parse(request.params);
    const result = await service.getGrupoDetalhes(codgrupo);
    if (!result) throw new NotFoundError('Grupo nao encontrado');
    return result;
  });

  app.get('/permissoes/usuarios', async (request) => {
    const params = listarSchema.parse(request.query);
    return service.getUsuarios(params);
  });

  app.get('/permissoes/usuarios/:codusu', async (request) => {
    const { codusu } = codusuSchema.parse(request.params);
    const result = await service.getUsuarioDetalhes(codusu);
    if (!result) throw new NotFoundError('Usuario nao encontrado');
    return result;
  });

  app.get('/permissoes/conflitos', async () => {
    return service.getConflitos();
  });
}
