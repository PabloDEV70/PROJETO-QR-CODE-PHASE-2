import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { ServicosGrupoMutationService } from '../../../domain/services/servicos-grupo-mutation.service';
import { ServicosGrupoService } from '../../../domain/services/servicos-grupo.service';
import { extractUserToken } from '../../../shared/utils/extract-token';

const codGrupoSchema = z.object({ codGrupo: z.coerce.number() });
const codProdSchema = z.object({ codProd: z.coerce.number() });

const createGrupoSchema = z.object({
  CODGRUPOPROD: z.number(),
  DESCRGRUPOPROD: z.string().max(30),
  CODGRUPAI: z.number().nullable().optional(),
});

const updateGrupoSchema = z.object({
  DESCRGRUPOPROD: z.string().max(30),
});

const toggleAtivoSchema = z.object({
  ativo: z.enum(['S', 'N']),
});

const updateServicoSchema = z.object({
  DESCRPROD: z.string(),
});

const moveServicoSchema = z.object({
  CODGRUPOPROD: z.number(),
});

export async function servicosGrupoMutationRoutes(app: FastifyInstance) {
  const mutationService = new ServicosGrupoMutationService();
  const queryService = new ServicosGrupoService();

  // GET arvore-todos (includes inactive)
  app.get('/servicos-grupo/arvore-todos', async () => {
    return queryService.getArvoreCompletaTodos();
  });

  // GET next cod grupo (suggestion)
  app.get('/servicos-grupo/next-cod', async (request) => {
    const { codGrupoPai } = z.object({
      codGrupoPai: z.coerce.number().optional(),
    }).parse(request.query);
    return mutationService.getNextCodGrupo(codGrupoPai);
  });

  // POST create grupo
  app.post('/servicos-grupo/grupos', async (request, reply) => {
    const body = createGrupoSchema.parse(request.body);
    const userToken = extractUserToken(request);
    reply.status(201);
    return mutationService.createGrupo(body, userToken);
  });

  // PUT update grupo
  app.put('/servicos-grupo/grupos/:codGrupo', async (request) => {
    const { codGrupo } = codGrupoSchema.parse(request.params);
    const body = updateGrupoSchema.parse(request.body);
    const userToken = extractUserToken(request);
    return mutationService.updateGrupo(codGrupo, body, userToken);
  });

  // PUT toggle grupo ativo
  app.put('/servicos-grupo/grupos/:codGrupo/ativo', async (request) => {
    const { codGrupo } = codGrupoSchema.parse(request.params);
    const body = toggleAtivoSchema.parse(request.body);
    const userToken = extractUserToken(request);
    return mutationService.toggleGrupoAtivo(codGrupo, body.ativo, userToken);
  });

  // PUT update servico
  app.put('/servicos-grupo/servicos/:codProd', async (request) => {
    const { codProd } = codProdSchema.parse(request.params);
    const body = updateServicoSchema.parse(request.body);
    const userToken = extractUserToken(request);
    return mutationService.updateServico(codProd, body, userToken);
  });

  // PUT move servico
  app.put('/servicos-grupo/servicos/:codProd/mover', async (request) => {
    const { codProd } = codProdSchema.parse(request.params);
    const body = moveServicoSchema.parse(request.body);
    const userToken = extractUserToken(request);
    return mutationService.moveServico(codProd, body.CODGRUPOPROD, userToken);
  });

  // PUT toggle servico ativo
  app.put('/servicos-grupo/servicos/:codProd/ativo', async (request) => {
    const { codProd } = codProdSchema.parse(request.params);
    const body = toggleAtivoSchema.parse(request.body);
    const userToken = extractUserToken(request);
    return mutationService.toggleServicoAtivo(codProd, body.ativo, userToken);
  });
}
