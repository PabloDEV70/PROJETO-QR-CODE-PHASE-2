import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { OsServicoExecService } from '../../../domain/services/os-servico-exec.service';
import { extractUserToken } from '../../../shared/utils/extract-token';

const paramsSchema = z.object({
  nuos: z.coerce.number(),
  sequencia: z.coerce.number(),
});

const bodySchema = z.object({
  codparc: z.number(),
});

export async function osServicoExecRoutes(app: FastifyInstance) {
  const service = new OsServicoExecService();

  app.post('/os-manutencao/:nuos/servicos/:sequencia/start', async (request) => {
    const { nuos, sequencia } = paramsSchema.parse(request.params);
    const { codparc } = bodySchema.parse(request.body);
    const userToken = extractUserToken(request);
    return service.startServico(nuos, sequencia, codparc, userToken);
  });

  app.post('/os-manutencao/:nuos/servicos/:sequencia/finish', async (request) => {
    const { nuos, sequencia } = paramsSchema.parse(request.params);
    const { codparc } = bodySchema.parse(request.body);
    const userToken = extractUserToken(request);
    return service.finishServico(nuos, sequencia, codparc, userToken);
  });
}
