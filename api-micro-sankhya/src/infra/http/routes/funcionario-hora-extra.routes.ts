import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { FuncionarioHoraExtraService } from '../../../domain/services/funcionario-hora-extra.service';
import { NotFoundError } from '../../../domain/errors';

const codparcSchema = z.object({
  codparc: z.coerce.number(),
});

const horaExtraQuerySchema = z.object({
  dataInicio: z.string().optional(),
  dataFim: z.string().optional(),
  agruparPor: z.enum(['dia', 'semana', 'mes']).optional(),
});

export async function funcionarioHoraExtraRoutes(app: FastifyInstance) {
  const service = new FuncionarioHoraExtraService();

  app.get('/funcionarios/:codparc/perfil-completo', async (request) => {
    const { codparc } = codparcSchema.parse(request.params);
    const result = await service.getPerfilCompleto(codparc);
    if (!result) throw new NotFoundError('Funcionário ativo não encontrado');
    return result;
  });

  app.get('/funcionarios/:codparc/hora-extra', async (request) => {
    const { codparc } = codparcSchema.parse(request.params);
    const query = horaExtraQuerySchema.parse(request.query);
    const result = await service.getApontamentosComHoraExtra(codparc, query);
    if (!result) throw new NotFoundError('Funcionário ativo não encontrado');
    return result;
  });
}
