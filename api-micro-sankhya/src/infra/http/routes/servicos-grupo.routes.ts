import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { ServicosGrupoService } from '../../../domain/services/servicos-grupo.service';

const codGrupoSchema = z.object({ codGrupo: z.coerce.number() });

/**
 * Rotas de Serviços e Grupos (/servicos-grupo/)
 * Árvore de serviços de manutenção por grupo
 */
export async function servicosGrupoRoutes(app: FastifyInstance) {
  const service = new ServicosGrupoService();

  app.get('/servicos-grupo/arvore', async () => {
    const tree = await service.getArvoreCompleta();
    return tree;
  });

  app.get('/servicos-grupo/grupos', async () => {
    const grupos = await service.getGrupos();
    return grupos;
  });

  app.get('/servicos-grupo/grupos/:codGrupo/servicos', async (request) => {
    const { codGrupo } = codGrupoSchema.parse(request.params);
    const servicos = await service.getServicosPorGrupo(codGrupo);
    return servicos;
  });
}
