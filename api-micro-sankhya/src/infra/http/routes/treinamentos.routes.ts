import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { ColaboradoresListaService } from '../../../domain/services/colaboradores-lista.service';

const listarSchema = z.object({
  limit: z.coerce.number().optional().default(25),
  page: z.coerce.number().optional().default(1),
  coddep: z.coerce.number().optional(),
});

const listarTodosSchema = z.object({
  coddep: z.coerce.number().optional(),
});

export async function treinamentosRoutes(app: FastifyInstance) {
  const colaboradoresService = new ColaboradoresListaService();

  // Lista colaboradores e seus treinamentos/habilitações
  app.get('/treinamentos', async (request, reply) => {
  try {
    const { limit, page, coddep } = listarSchema.parse(request.query);
    
    // Calcula o offset para passar para o banco
    const calculatedLimit = limit ?? 25;
    const calculatedOffset = ((page ?? 1) - 1) * calculatedLimit;

    // 1. Passamos os parâmetros para o serviço (corrige o erro de "Expected 1 argument")
    const result = await colaboradoresService.listar({
      limit: calculatedLimit,
      offset: calculatedOffset,
      coddep,
    });

    // 2. O result já vem com { data, total }, então não usamos .slice nem .length
    return {
      data: result.data,
      total: result.total,
      limit: calculatedLimit,
      page: page ?? 1,
      coddep,
    };
  } catch (error) {
    console.error('Erro ao listar colaboradores e treinamentos:', error);
    return reply.status(500).send({ error: 'Erro ao processar a requisição' });
  }
})

  app.get('/treinamentos/todos', async (request, reply) => {
    try {
      const { coddep } = listarTodosSchema.parse(request.query);
      const result = await colaboradoresService.listarTodos({ coddep });
      return result;
    } catch (error) {
      console.error('Erro ao listar todos os colaboradores para impressão:', error);
      return reply.status(500).send({ error: 'Erro ao processar a requisição' });
    }
  });
}