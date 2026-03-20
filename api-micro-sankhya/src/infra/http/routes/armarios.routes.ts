import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { ArmarioService } from '../../../domain/services/armario.service';
import { NotFoundError } from '../../../domain/errors';

const funcionarioParamsSchema = z.object({
  codemp: z.coerce.number().min(1),
  codfunc: z.coerce.number().min(1),
});

const publicoParamsSchema = z.object({
  codarmario: z.coerce.number().min(1),
});

const listarQuerySchema = z.object({
  page: z.coerce.number().min(1).optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
  localArm: z.coerce.number().min(1).max(11).optional(),
  ocupado: z.enum(['true', 'false']).optional(),
  departamento: z.string().max(100).optional(),
  termo: z.string().max(100).optional(),
  orderBy: z.enum(['codarmario', 'nuarmario', 'localDescricao', 'nomeFuncionario', 'tagArmario']).optional(),
  orderDir: z.enum(['ASC', 'DESC']).optional(),
});

const todosQuerySchema = z.object({
  localArm: z.coerce.number().min(1).max(11).optional(),
  ocupado: z.enum(['true', 'false']).optional(),
  departamento: z.string().max(100).optional(),
  termo: z.string().max(100).optional(),
  orderBy: z.enum(['codarmario', 'nuarmario', 'localDescricao', 'nomeFuncionario', 'tagArmario']).optional(),
  orderDir: z.enum(['ASC', 'DESC']).optional(),
});

export async function armariosRoutes(app: FastifyInstance) {
  const armarioService = new ArmarioService();

  app.get('/armarios', async (request) => {
    const query = listarQuerySchema.parse(request.query);
    return armarioService.listar({
      page: query.page,
      limit: query.limit,
      localArm: query.localArm,
      ocupado: query.ocupado === 'true' ? true : query.ocupado === 'false' ? false : undefined,
      departamento: query.departamento,
      termo: query.termo,
      orderBy: query.orderBy,
      orderDir: query.orderDir,
    });
  });

  app.get('/armarios/locais', async () => {
    return armarioService.listarLocais();
  });

  app.get('/armarios/todos', async (request) => {
    const query = todosQuerySchema.parse(request.query);
    const data = await armarioService.listarTodos({
      localArm: query.localArm,
      ocupado: query.ocupado === 'true' ? true : query.ocupado === 'false' ? false : undefined,
      departamento: query.departamento,
      termo: query.termo,
      orderBy: query.orderBy,
      orderDir: query.orderDir,
    });
    return { data };
  });

  app.get('/armarios/funcionario/:codemp/:codfunc', async (request) => {
    const { codemp, codfunc } = funcionarioParamsSchema.parse(request.params);
    const armario = await armarioService.getByFuncionario(codemp, codfunc);
    if (!armario) throw new NotFoundError('Armario nao encontrado para este funcionario');
    return armario;
  });

  app.get('/armarios/publico/:codarmario', async (request) => {
    const { codarmario } = publicoParamsSchema.parse(request.params);
    const armario = await armarioService.getPublico(codarmario);
    if (!armario) throw new NotFoundError('Armario nao encontrado');
    return armario;
  });
}
